function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'health';
  if (action === 'health') {
    return jsonResponse_({ ok: true, app: 'Pacha Eats', version: '0.1.0', timestamp: new Date().toISOString() });
  }
  return jsonResponse_({ ok: false, error: 'ACTION_NOT_FOUND', action: action });
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (error) {
    return jsonResponse_({ ok: false, error: 'INVALID_JSON' });
  }

  const action = payload.action || '';
  if (action === 'ping') {
    return jsonResponse_({ ok: true, data: { message: 'pong' } });
  }

  return jsonResponse_({ ok: false, error: 'ACTION_NOT_FOUND', action: action });
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
