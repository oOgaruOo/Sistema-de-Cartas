<?php
/* carta.php · GET ?id=codigo  |  ?id=codigo&editar=1&admin=hash
   - Sin id: sonda (¿hay PHP?).
   - Lectura: datos públicos (con pista, para su pantalla de acceso).
     El hash 'admin' NUNCA sale del servidor.
   - Edición: exige el hash correcto ANTES de entregar la carta. */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder($ok, $extra = array(), $codigo = 200) {
  http_response_code($codigo);
  echo json_encode(array_merge(array('ok' => $ok), $extra));
  exit;
}

if (!isset($_GET['id'])) responder(false, array('error' => 'falta id'));

 $id = preg_replace('/[^a-zA-Z0-9]/', '', (string)$_GET['id']);
if (strlen($id) < 6 || strlen($id) > 20) responder(false, array('error' => 'id inválido'));

 $archivo = __DIR__ . '/../data/cartas/' . $id . '.json';
if (!is_file($archivo)) responder(false, array('error' => 'carta no encontrada'));

 $datos = json_decode(file_get_contents($archivo), true);
if (!is_array($datos) || empty($datos['clave']) || empty($datos['bloques'])) {
  responder(false, array('error' => 'carta corrupta'));
}

/* ---- modo edición: verificar contraseña ANTES de entregar nada ---- */
if (isset($_GET['editar'])) {
  $adminGuardada = !empty($datos['admin']) ? strtolower($datos['admin']) : '';
  $adminDada = isset($_GET['admin']) ? strtolower((string)$_GET['admin']) : '';
  $esHash = function ($s) { return is_string($s) && preg_match('/^[a-fA-F0-9]{64}$/', $s) === 1; };

  if ($adminGuardada === '') responder(false, array('error' => 'Esta carta no puede editarse.'), 403);

  if ($esHash($adminDada) && hash_equals($adminGuardada, $adminDada)) {
    unset($datos['admin']);   /* verificada en servidor: no hace falta devolverla */
    responder(true, array('datos' => $datos));
  }
  usleep(400000);   /* frena fuerza bruta */
  responder(false, array('error' => 'Contraseña de editor incorrecta.'), 403);
}

/* ---- modo lectura: público para ella; el hash admin jamás viaja ---- */
unset($datos['admin']);
responder(true, array('datos' => $datos));