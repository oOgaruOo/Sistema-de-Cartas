<?php
/* guardar.php · POST JSON:
   { id?, para, de, despedida, pista, clave(hash|''), admin(hash), texto, tema? }
   - Sin id → CREA carta nueva (código aleatorio; máx. 5/IP/hora).
   - Con id → EDITA (exige contraseña de editor; conserva 'creada' y 'tema' si no llegan). */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder($ok, $extra = array(), $codigo = 200) {
  http_response_code($codigo);
  echo json_encode(array_merge(array('ok' => $ok), $extra));
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') responder(false, array('error' => 'Método no permitido'), 405);

 $crudo = file_get_contents('php://input');
if (strlen($crudo) > 20000) responder(false, array('error' => 'Datos demasiado grandes'), 413);

 $e = json_decode($crudo, true);
if (!is_array($e)) responder(false, array('error' => 'Datos inválidos'), 400);

function esHash($s) { return is_string($s) && preg_match('/^[a-fA-F0-9]{64}$/', $s) === 1; }
function txt($v, $n) {
  $s = trim((string)$v);
  return function_exists('mb_substr') ? mb_substr($s, 0, $n, 'UTF-8') : substr($s, 0, $n);
}

 $TEMAS_PERMITIDOS = array('disculpa', 'teextrano', 'cumple', 'madre', 'aniversario');

 $dir = __DIR__ . '/../data/cartas';
if (!is_dir($dir)) @mkdir($dir, 0755, true);

/* ---- ¿crear o actualizar? ---- */
 $id = '';
if (!empty($e['id'])) $id = preg_replace('/[^a-zA-Z0-9]/', '', (string)$e['id']);

 $actual = array();

if ($id !== '') {
  $archivo = $dir . '/' . $id . '.json';
  if (!is_file($archivo)) responder(false, array('error' => 'Carta no encontrada.'), 404);
  $actual = json_decode(file_get_contents($archivo), true);
  $adminGuardada = (is_array($actual) && !empty($actual['admin'])) ? strtolower($actual['admin']) : '';
  if ($adminGuardada === '') responder(false, array('error' => 'Esta carta no puede editarse.'), 403);
  $adminDada = isset($e['admin']) ? strtolower((string)$e['admin']) : '';
  if (!esHash($adminDada) || !hash_equals($adminGuardada, $adminDada)) {
    usleep(400000);
    responder(false, array('error' => 'La contraseña de editor no coincide.'), 403);
  }
  $actualClave = !empty($actual['clave']) ? $actual['clave'] : '';
} else {
  /* anti-spam: 5 creaciones por IP y hora (con poda del archivo) */
  $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'x';
  $rlf = __DIR__ . '/../data/rl.json';
  $rl = is_file($rlf) ? (json_decode(file_get_contents($rlf), true) ?: array()) : array();
  $ahora = time();

  foreach ($rl as $ipVieja => $ts) {
    if (!is_array($ts)) { unset($rl[$ipVieja]); continue; }
    $vivos = array();
    foreach ($ts as $t) if ($t > $ahora - 3600) $vivos[] = $t;
    if ($vivos) $rl[$ipVieja] = $vivos; else unset($rl[$ipVieja]);
  }

  $recientes = isset($rl[$ip]) ? $rl[$ip] : array();
  if (count($recientes) >= 5)
    responder(false, array('error' => 'Demasiadas cartas creadas desde esta conexión en la última hora. Inténtalo más tarde.'), 429);
  $rl[$ip] = array_merge($recientes, array($ahora));
  @file_put_contents($rlf, json_encode($rl), LOCK_EX);

  $intentos = 0;
  do { $id = bin2hex(random_bytes(5)); $intentos++; }
  while (is_file($dir . '/' . $id . '.json') && $intentos < 25);
  $actualClave = '';
}

 $archivo = $dir . '/' . $id . '.json';

/* ---- campos ---- */
 $admin = isset($e['admin']) ? strtolower((string)$e['admin']) : '';
if (!esHash($admin)) responder(false, array('error' => 'Falta la contraseña de editor.'), 400);

 $clave = isset($e['clave']) ? (string)$e['clave'] : '';
if (esHash($clave)) $claveFinal = strtolower($clave);
elseif ($clave === '' && $actualClave !== '') $claveFinal = $actualClave;
else responder(false, array('error' => 'La palabra secreta no se recibió correctamente.'), 400);

/* tema: lista blanca; al editar, conservar el actual si no llega */
 $tema = 'disculpa';
if (isset($e['tema']) && in_array((string)$e['tema'], $TEMAS_PERMITIDOS, true)) $tema = (string)$e['tema'];
elseif ($id !== '' && !empty($actual['tema'])) $tema = $actual['tema'];

/* fecha de escritura: nace con la carta y no cambia nunca */
 $creada = date('c');
if ($id !== '' && !empty($actual['creada'])) $creada = $actual['creada'];

/* ---- texto → bloques ---- */
 $texto = isset($e['texto']) ? (string)$e['texto'] : '';
 $largo = function_exists('mb_strlen') ? mb_strlen($texto) : strlen($texto);
if ($largo > 8000) responder(false, array('error' => 'La carta es demasiado larga (máx. 8000 caracteres).'), 400);

 $bloques = array();
foreach (preg_split('/\n\s*\n/u', trim($texto)) as $b) {
  $b = trim($b);
  if ($b === '') continue;
  if (preg_match('/^\*(.+)\*$/su', $b, $m)) $bloques[] = array('tipo' => 'enfasis', 'texto' => trim($m[1]));
  else $bloques[] = array('tipo' => 'parrafo', 'texto' => $b);
}
if (!count($bloques)) responder(false, array('error' => 'Escribe al menos un párrafo.'), 400);
if (count($bloques) > 40) responder(false, array('error' => 'La carta tiene demasiados párrafos (máx. 40).'), 400);
 $bloques[] = array('tipo' => 'firma');

 $datos = array(
  'para'      => txt(isset($e['para']) ? $e['para'] : '', 24),
  'de'        => txt(isset($e['de']) ? $e['de'] : '', 24),
  'clave'     => $claveFinal,
  'pista'     => txt(isset($e['pista']) ? $e['pista'] : '', 80),
  'admin'     => $admin,
  'tema'      => $tema,
  'creada'    => $creada,
  'despedida' => txt((isset($e['despedida']) && $e['despedida'] !== '') ? $e['despedida'] : 'Con todo mi corazón,', 60),
  'bloques'   => $bloques
);

 $ok = @file_put_contents($archivo, json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
if ($ok === false)
  responder(false, array('error' => 'No se pudo escribir en el servidor: da permisos 775 a la carpeta data/cartas.'), 500);

responder(true, array('id' => $id, 'clave' => $claveFinal));