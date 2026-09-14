<?php
declare(strict_types=1);
require __DIR__ . '/ChunkStore.php';
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = sys_get_temp_dir() . '/inavet-chunk-test-' . bin2hex(random_bytes(8));
mkdir($root, 0700);
$checks = 0;
function check(bool $ok): void { global $checks; if (!$ok) throw new RuntimeException('Assertion failed'); $checks++; }
function rejected(callable $fn): void { try { $fn(); } catch (Throwable $e) { check(true); return; } throw new RuntimeException('Expected rejection'); }
function input(string $data) { $s = fopen('php://temp', 'w+b'); fwrite($s, $data); rewind($s); return $s; }
try {
    $store = new ChunkStore($root);
    $id = str_repeat('a', 32);
    rejected(fn() => $store->create('../unsafe', 1));
    rejected(fn() => $store->create($id, 500000001));
    $store->create($id, ChunkStore::CHUNK_BYTES + 3);
    $first = str_repeat('x', ChunkStore::CHUNK_BYTES);
    $hash = hash('sha256', $first);
    rejected(fn() => $store->append($id, 1, hash('sha256', 'end'), input('end')));
    rejected(fn() => $store->append($id, 0, str_repeat('0',64), input($first)));
    check($store->append($id, 0, $hash, input($first))['received'] === ChunkStore::CHUNK_BYTES);
    check($store->append($id, 0, $hash, input($first))['received'] === ChunkStore::CHUNK_BYTES);
    rejected(fn() => $store->seal($id));
    rejected(fn() => $store->append($id, 1, hash('sha256','ends'), input('ends')));
    $store->append($id, 1, hash('sha256', 'end'), input('end'));
    $state = $store->seal($id);
    check($state['sha256'] === hash('sha256', $first . 'end'));
    check($store->seal($id) === $state);
    echo "PASS: $checks chunk integrity/retry/limit checks\n";
} finally {
    // Only fixtures generated in this run, never user material.
    foreach (glob($root . '/*') as $dir) { foreach (glob($dir . '/*') as $file) unlink($file); rmdir($dir); }
    rmdir($root);
}
