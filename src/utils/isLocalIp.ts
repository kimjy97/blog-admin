const LOCAL_IPS = ['127.0.0.1', '::1', 'localhost'];

export const isLocalIp = (ip: string): boolean => {
  return LOCAL_IPS.includes(ip);
}