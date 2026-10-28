declare const __ROOM_API__: string | undefined;
export const ROOM_API = typeof __ROOM_API__ === 'string' ? __ROOM_API__ : '/api/room';
