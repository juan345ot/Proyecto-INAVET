<?php
declare(strict_types=1);

/** Private storage primitive. Never expose this class directly as an HTTP endpoint.
 * The future controller must verify admin authorization, upload ticket, quota and MIME.
 */
final class ChunkStore
{
    public const MAX_BYTES = 500000000;
    public const CHUNK_BYTES = 5000000;
    private string $root;

    public function __construct(string $root)
    {
        if (!is_dir($root) || is_link($root)) throw new RuntimeException('Private directory required');
        $resolved = realpath($root);
        if ($resolved === false) throw new RuntimeException('Invalid storage directory');
        $this->root = $resolved;
    }

    private function directory(string $id): string
    {
        if (!preg_match('/\A[a-f0-9]{32}\z/', $id)) throw new InvalidArgumentException('Invalid upload id');
        return $this->root . DIRECTORY_SEPARATOR . $id;
    }

    public function create(string $id, int $size): void
    {
        if ($size < 1 || $size > self::MAX_BYTES) throw new InvalidArgumentException('Limit: 500 MB');
        $dir = $this->directory($id);
        if (!mkdir($dir, 0700)) throw new RuntimeException('Upload already exists or directory unavailable');
        $this->save($dir, ['size' => $size, 'received' => 0, 'hashes' => [], 'complete' => false]);
    }

    private function save(string $dir, array $state): void
    {
        $encoded = json_encode($state, JSON_THROW_ON_ERROR);
        if (file_put_contents($dir . '/state.next', $encoded) !== strlen($encoded) ||
            !rename($dir . '/state.next', $dir . '/state.json')) throw new RuntimeException('Cannot save upload state');
    }

    private function locked(string $id, callable $action): mixed
    {
        $dir = $this->directory($id);
        if (!is_dir($dir) || is_link($dir)) throw new RuntimeException('Unknown upload');
        $lock = fopen($dir . '/lock', 'c');
        if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Cannot lock upload');
        try {
            $state = json_decode(file_get_contents($dir . '/state.json'), true, 512, JSON_THROW_ON_ERROR);
            return $action($dir, $state);
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /** $input is a stream (e.g. php://input), not a buffered 500 MB string. */
    public function append(string $id, int $index, string $sha256, $input): array
    {
        if (!is_resource($input) || !preg_match('/\A[a-f0-9]{64}\z/', $sha256)) throw new InvalidArgumentException('Invalid fragment');
        return $this->locked($id, function ($dir, $state) use ($index, $sha256, $input) {
            $count = (int)ceil($state['size'] / self::CHUNK_BYTES);
            if ($index < 0 || $index >= $count) throw new InvalidArgumentException('Invalid fragment index');
            if (isset($state['hashes'][$index])) {
                if (!hash_equals($state['hashes'][$index], $sha256)) throw new RuntimeException('Fragment conflict');
                return $state; // Retry is idempotent, including after completion.
            }
            if ($state['complete'] || $index !== count($state['hashes'])) throw new RuntimeException('Out of order fragment');
            $expected = min(self::CHUNK_BYTES, $state['size'] - $state['received']);
            $out = fopen($dir . '/payload.part', 'c+b');
            if (!$out) throw new RuntimeException('Cannot open payload');
            $committed = $state['received'];
            try {
                // Recover an interrupted append that was never committed in state.json.
                if (!ftruncate($out, $committed) || fseek($out, $committed) !== 0) throw new RuntimeException('Cannot resume payload');
                $hash = hash_init('sha256');
                $bytes = 0;
                while (!feof($input)) {
                    $data = fread($input, min(65536, $expected - $bytes + 1));
                    if ($data === false || ($data === '' && !feof($input))) throw new RuntimeException('Input read failed');
                    $bytes += strlen($data);
                    if ($bytes > $expected) throw new RuntimeException('Fragment too large');
                    hash_update($hash, $data);
                    if ($data !== '' && fwrite($out, $data) !== strlen($data)) throw new RuntimeException('Disk write failed');
                }
                if ($bytes !== $expected || !hash_equals($sha256, hash_final($hash))) throw new RuntimeException('Fragment integrity failure');
                if (!fflush($out)) throw new RuntimeException('Flush failed');
                $state['received'] += $bytes;
                $state['hashes'][] = $sha256;
                $this->save($dir, $state);
                return $state;
            } catch (Throwable $error) {
                ftruncate($out, $committed);
                throw $error;
            } finally {
                fclose($out);
            }
        });
    }

    /** Only seals private bytes; does NOT publish or create a course material. */
    public function seal(string $id): array
    {
        return $this->locked($id, function ($dir, $state) {
            if ($state['received'] !== $state['size']) throw new RuntimeException('Incomplete upload');
            if (!$state['complete']) {
                $state['sha256'] = hash_file('sha256', $dir . '/payload.part');
                if ($state['sha256'] === false) throw new RuntimeException('Cannot verify file');
                $state['complete'] = true;
                $this->save($dir, $state);
            }
            return $state;
        });
    }
}
