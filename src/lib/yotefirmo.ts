import { retry } from '@/lib/utils';

const openSocket = async (socketAddr: string) => {
  const socket = new WebSocket('ws://localhost:9999');
  await new Promise((res, rej) => {
    socket.addEventListener('error', rej);
    socket.addEventListener('open', res);
  });

  return socket;
};

export async function requestUserInteraction(
  action: 'encrypt' | 'sign',
  payload: Buffer,
  maxRetries: number = 5
) {
  if (!window) {
    throw 'This function is browser only';
  }

  // window.location.href = 'yotefirmo://';
  const socket = await retry(
    () => openSocket('ws://localhost:9999'),
    maxRetries
  );

  return await new Promise<string>((resolve) => {
    socket.send(
      JSON.stringify({ action, payload: payload.toJSON().data }, null, 0)
    );

    socket.addEventListener('message', (evt) => {
      resolve(evt.data);
    });
  });
}
