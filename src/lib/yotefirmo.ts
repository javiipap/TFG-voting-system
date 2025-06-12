export async function requestUserInteraction(
  action: 'encrypt' | 'sign',
  payload: Buffer
) {
  if (!window) {
    throw 'This function is browser only';
  }

  window.location.href = 'yotefirmo://';
  const socket = new WebSocket('ws://localhost:9999');

  return await new Promise<string>((resolve) => {
    socket.addEventListener('open', (_evt) => {
      socket.send(
        JSON.stringify({ action, payload: payload.toJSON().data }, null, 0)
      );

      socket.addEventListener('message', (evt) => {
        resolve(evt.data);
      });
    });
  });
}
