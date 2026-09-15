<?php
declare(strict_types=1);
require_once __DIR__ . '/ChunkStore.php';
ini_set('display_errors', '0');
$config = json_decode(file_get_contents(__DIR__ . '/config.json'), true, 512, JSON_THROW_ON_ERROR);
$root = $config['root'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    if (!in_array($origin, ['https://inavet.com.ar', 'https://www.inavet.com.ar', 'https://inavet-frontend.onrender.com'], true)) { http_response_code(403); exit; }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Authorization, X-Storage-Token, Content-Type, X-Chunk-Index, X-Chunk-SHA256');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Cache-Control: private, no-store');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
function reply(array $data): never { header('Content-Type: application/json'); echo json_encode(['success'=>true,'data'=>$data]); exit; }
function claims(string $token, string $secret): array {
    if (strlen($secret)<32 || strlen($token)>4096 || !preg_match('/\A([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\z/', $token, $m)) throw new RuntimeException('Invalid token');
    $provided = base64_decode(strtr($m[2], '-_', '+/'), true);
    if ($provided===false || !hash_equals(hash_hmac('sha256',$m[1],$secret,true),$provided)) throw new RuntimeException('Invalid signature');
    $c=json_decode(base64_decode(strtr($m[1], '-_', '+/'), true),true,512,JSON_THROW_ON_ERROR);
    if (($c['v']??0)!==1 || ($c['aud']??'')!=='inavet-storage' || !is_int($c['exp']??null) || !is_int($c['iat']??null) || $c['exp']<=time() || $c['iat']>time()+30 || $c['exp']-$c['iat']>3600 || !preg_match('/\A[a-f0-9]{32}\z/',$c['uploadId']??'')) throw new RuntimeException('Expired or invalid token');
    return $c;
}
function saveMeta(string $dir,array $data): void {
    $json=json_encode($data,JSON_THROW_ON_ERROR);
    if(file_put_contents($dir.'/meta.next',$json)!==strlen($json) || !rename($dir.'/meta.next',$dir.'/meta.json')) throw new RuntimeException('Cannot save metadata');
}
function removeUpload(string $dir): void {
    // Caller must validate 32-hex id and hold the global and upload locks.
    foreach(['payload.part','state.json','state.next','meta.json','meta.next','lock'] as $name) if(is_file($dir.'/'.$name)) unlink($dir.'/'.$name);
    if(is_dir($dir)) rmdir($dir);
}
function detectMime(string $path,string $name): string {
    $ext=strtolower(pathinfo($name,PATHINFO_EXTENSION));
    $f=fopen($path,'rb'); $magic=fread($f,16); fclose($f);
    if($ext==='pdf' && str_starts_with($magic,'%PDF-')) return 'application/pdf';
    if(in_array($ext,['ppt','doc'],true) && str_starts_with($magic,hex2bin('d0cf11e0a1b11ae1'))) return 'application/octet-stream';
    if(in_array($ext,['pptx','docx'],true)) {
        $zip=new ZipArchive();
        if($zip->open($path)===true) {
            $valid=$zip->locateName('[Content_Types].xml')!==false && $zip->locateName($ext==='pptx'?'ppt/presentation.xml':'word/document.xml')!==false;
            $zip->close();
            if($valid) return 'application/octet-stream';
        }
    }
    $mime=(new finfo(FILEINFO_MIME_TYPE))->file($path);
    $images=['jpg'=>'image/jpeg','jpeg'=>'image/jpeg','png'=>'image/png','webp'=>'image/webp','gif'=>'image/gif'];
    if(isset($images[$ext]) && $mime===$images[$ext]) return $mime;
    throw new RuntimeException('File content does not match extension');
}
try {
    if(isset($_GET['download'])) {
        if($_SERVER['REQUEST_METHOD']!=='GET') throw new RuntimeException('Method denied');
        $token=(string)$_GET['download']; $c=claims($token,$config['secret']);
        if($c['op']!=='download') throw new RuntimeException('Operation denied');
        // Current account status and class authorization are checked on each request.
        $curl=curl_init($config['authorizeUrl']);
        curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>json_encode(['token'=>$token]),CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>60,CURLOPT_CONNECTTIMEOUT=>15]);
        $response=curl_exec($curl); $status=curl_getinfo($curl,CURLINFO_RESPONSE_CODE); curl_close($curl);
        if($status!==200 || !(json_decode((string)$response,true)['success']??false)) throw new RuntimeException('Access denied');
        $dir=$root.'/'.$c['uploadId'];
        if(!is_dir($dir) || is_link($dir)) throw new RuntimeException('File unavailable');
        $lock=fopen($dir.'/lock','c'); if(!$lock || !flock($lock,LOCK_SH)) throw new RuntimeException('File unavailable');
        $meta=json_decode(file_get_contents($dir.'/meta.json'),true,512,JSON_THROW_ON_ERROR);
        $state=json_decode(file_get_contents($dir.'/state.json'),true,512,JSON_THROW_ON_ERROR);
        if(!($state['complete']??false) || !($meta['committed']??false)) throw new RuntimeException('File unavailable');
        $size=$state['size']; $start=0; $end=$size-1;
        if(isset($_SERVER['HTTP_RANGE'])) {
            if(!preg_match('/\Abytes=(\d*)-(\d*)\z/',$_SERVER['HTTP_RANGE'],$range) || ($range[1]===''&&$range[2]==='')) {http_response_code(416);header('Content-Range: bytes */'.$size);exit;}
            if($range[1]==='') $start=max(0,$size-(int)$range[2]);
            else { $start=(int)$range[1]; if($range[2]!=='') $end=min($end,(int)$range[2]); }
            if($start>$end || $start>=$size) {http_response_code(416);header('Content-Range: bytes */'.$size);exit;}
            http_response_code(206); header("Content-Range: bytes $start-$end/$size");
        }
        header('Accept-Ranges: bytes'); header('Content-Length: '.($end-$start+1));
        header('Content-Type: '.($meta['mime']??'application/octet-stream'));
        header("Content-Disposition: attachment; filename*=UTF-8''".rawurlencode($meta['name']));
        set_time_limit(0); while(ob_get_level()) ob_end_clean();
        $f=fopen($dir.'/payload.part','rb'); fseek($f,$start); $left=$end-$start+1;
        while($left>0 && !feof($f) && !connection_aborted()) { $data=fread($f,min(65536,$left)); if($data===false||$data==='')break;echo $data;$left-=strlen($data); }
        fclose($f);flock($lock,LOCK_UN);fclose($lock);exit;
    }
    if($_SERVER['REQUEST_METHOD']!=='POST') throw new RuntimeException('Method denied');
    $auth=isset($_SERVER['HTTP_X_STORAGE_TOKEN']) ? 'Bearer '.$_SERVER['HTTP_X_STORAGE_TOKEN'] : ($_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'');
    if(!str_starts_with($auth,'Bearer ')) throw new RuntimeException('Authorization required');
    $c=claims(substr($auth,7),$config['secret']); $action=$_GET['action']??'';
    if(!in_array($action,['create','chunk','seal','commit','delete','cancel'],true)) throw new RuntimeException('Invalid operation');
    if(in_array($action,['create','chunk','cancel'],true) ? $c['op']!=='upload' : $c['op']!==$action) throw new RuntimeException('Operation denied');
    $dir=$root.'/'.$c['uploadId']; $store=new ChunkStore($root);
    if($action==='chunk') {
        $meta=json_decode(file_get_contents($dir.'/meta.json'),true,512,JSON_THROW_ON_ERROR);
        if($meta['adminId']!==($c['adminId']??'') || $meta['size']!==($c['size']??0)) throw new RuntimeException('Upload mismatch');
        $index=$_SERVER['HTTP_X_CHUNK_INDEX']??'';
        if(!preg_match('/\A\d{1,3}\z/',$index)) throw new RuntimeException('Invalid fragment index');
        $state=$store->append($c['uploadId'],(int)$index,$_SERVER['HTTP_X_CHUNK_SHA256']??'',fopen('php://input','rb'));
        reply(['received'=>$state['received']]);
    }
    $global=fopen($root.'/quota.lock','c'); if(!$global || !flock($global,LOCK_EX)) throw new RuntimeException('Storage busy');
    if($action==='create') {
        if(!is_int($c['size']??null)||$c['size']<1||$c['size']>ChunkStore::MAX_BYTES || !is_string($c['name']??null)||strlen($c['name'])>960||preg_match('/[\x00-\x1f\x7f\/\\\\]/',$c['name']) || !preg_match('/\A[a-f0-9]{24}\z/',$c['adminId']??'')||!preg_match('/\A[a-f0-9]{24}\z/',$c['lessonId']??'')) throw new RuntimeException('Invalid upload');
        if(is_dir($dir)) {
            $meta=json_decode(file_get_contents($dir.'/meta.json'),true,512,JSON_THROW_ON_ERROR);
            if($meta['size']!==$c['size'] || $meta['adminId']!==$c['adminId']) throw new RuntimeException('Upload mismatch');
            reply(['ready'=>true]);
        }
        $used=0;
        foreach(glob($root.'/*/meta.json') as $file) {
            $m=json_decode(file_get_contents($file),true,512,JSON_THROW_ON_ERROR);
            $candidate=dirname($file);
            $candidateId=basename($candidate);
            $candidateState=json_decode(file_get_contents($candidate.'/state.json'),true,512,JSON_THROW_ON_ERROR);
            // Only expired, unsealed temporary uploads; never a published or sealed file.
            if(preg_match('/\A[a-f0-9]{32}\z/',$candidateId) && !($m['committed']??false) && !($candidateState['complete']??false) && $m['expires']<time()-86400) {
                $expiredLock=fopen($candidate.'/lock','c');
                if($expiredLock && flock($expiredLock,LOCK_EX)) {removeUpload($candidate);flock($expiredLock,LOCK_UN);fclose($expiredLock);continue;}
            }
            $used+=$m['size'];
            if(!($m['committed']??false) && $m['adminId']===$c['adminId'] && $m['expires']>time()) throw new RuntimeException('Another upload is in progress; retry the same file');
        }
        if($used+$c['size']>15000000000 || disk_free_space($root)<$c['size']+1000000000) throw new RuntimeException('Insufficient storage');
        $store->create($c['uploadId'],$c['size']);
        saveMeta($dir,['name'=>$c['name'],'size'=>$c['size'],'adminId'=>$c['adminId'],'lessonId'=>$c['lessonId'],'expires'=>$c['exp'],'committed'=>false]);
        reply(['ready'=>true]);
    }
    if($action==='cancel' && is_dir($dir)) {
        $meta=json_decode(file_get_contents($dir.'/meta.json'),true,512,JSON_THROW_ON_ERROR);
        $state=json_decode(file_get_contents($dir.'/state.json'),true,512,JSON_THROW_ON_ERROR);
        if($meta['adminId']!==($c['adminId']??'') || ($meta['committed']??false) || ($state['complete']??false)) throw new RuntimeException('El archivo ya se está guardando. Reintentá Guardar para finalizar.');
    }
    if($action==='delete' || $action==='cancel') {
        if(is_dir($dir)) { $lock=fopen($dir.'/lock','c');flock($lock,LOCK_EX);removeUpload($dir);flock($lock,LOCK_UN);fclose($lock); }
        reply(['deleted'=>true]);
    }
    $meta=json_decode(file_get_contents($dir.'/meta.json'),true,512,JSON_THROW_ON_ERROR);
    $meta['mime']=detectMime($dir.'/payload.part',$meta['name']);
    $state=$store->seal($c['uploadId']);
    if($action==='commit') $meta['committed']=true;
    saveMeta($dir,$meta);
    reply(['size'=>$state['size'],'sha256'=>$state['sha256'],'mime'=>$meta['mime']]);
} catch(Throwable $error) {
    if(!headers_sent()) {http_response_code(400);header('Content-Type: application/json');echo json_encode(['success'=>false,'message'=>'No se pudo procesar el archivo: '.$error->getMessage()]);}
}
