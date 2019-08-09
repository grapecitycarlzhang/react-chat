import uuidv4 from "uuid/v4";
export function guid(options?, buffer?, offset?) {
  return uuidv4(options, buffer, offset);
}
