<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli') {http_response_code(404);exit;}
$config=json_decode(file_get_contents(__DIR__.'/config.json'),true,512,JSON_THROW_ON_ERROR);
$url='https://inavet.com.ar/material-storage.php';
$id=bin2hex(random_bytes(16)); $size=(int)($argv[1]??500000000);
function ticket(array $claims): string {global $config;$c=array_merge($claims,['v'=>1,'aud'=>'inavet-storage','iat'=>time(),'exp'=>time()+3600]);$p=rtrim(strtr(base64_encode(json_encode($c,JSON_UNESCAPED_SLASHES)),'+/','-_'),'=');return $p.'.'.rtrim(strtr(base64_encode(hash_hmac('sha256',$p,$config['secret'],true)),'+/','-_'),'=');}
function callStorage(string $op,string $token,string $body='',array $extra=[]): array {global $url;$curl=curl_init($url.'?action='.$op);curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>$body,CURLOPT_HTTPHEADER=>array_merge(['X-Storage-Token: '.$token,'Content-Type: application/octet-stream'],$extra),CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>90]);$raw=curl_exec($curl);$status=curl_getinfo($curl,CURLINFO_RESPONSE_CODE);$err=curl_error($curl);curl_close($curl);$json=json_decode((string)$raw,true);if($status!==200||!($json['success']??false))throw new RuntimeException("HTTP $status ".($json['message']??$err));return $json['data'];}
$auth=ticket(['op'=>'upload','uploadId'=>$id,'adminId'=>str_repeat('c',24),'lessonId'=>str_repeat('d',24),'name'=>'inavet-temporal-500mb.pdf','size'=>$size]);
$created=false;
try {
    callStorage('create',$auth);$created=true;$hash=hash_init('sha256');
    for($offset=0,$index=0;$offset<$size;$offset+=1000000,$index++) {
        $chunk=str_repeat(' ',min(1000000,$size-$offset));
        if($index===0)$chunk=substr_replace($chunk,"%PDF-1.7\n",0,9);
        if($offset+strlen($chunk)===$size)$chunk=substr_replace($chunk,"\n%%EOF\n",-7);
        hash_update($hash,$chunk);$headers=['X-Chunk-Index: '.$index,'X-Chunk-SHA256: '.hash('sha256',$chunk)];
        callStorage('chunk',$auth,$chunk,$headers);
        if($index===0)callStorage('chunk',$auth,$chunk,$headers);
        if(($index+1)%50===0)echo 'Uploaded '.($offset+strlen($chunk))."/$size\n";
    }
    $result=callStorage('seal',ticket(['op'=>'seal','uploadId'=>$id]));
    if($result['size']!==$size||$result['sha256']!==hash_final($hash))throw new RuntimeException('Integrity mismatch');
    echo "PASS: $size bytes over HTTPS, hash verified, retry verified\n";
} finally {if($created){callStorage('delete',ticket(['op'=>'delete','uploadId'=>$id]));echo "Temporary upload removed\n";}}
