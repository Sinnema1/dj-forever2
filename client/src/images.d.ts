// Allow importing JPEG images as modules
declare module "*.jpeg" {
  const value: string;
  export default value;
}
declare module "*.jpg" {
  const value: string;
  export default value;
}
declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.svg" {
  const value: string;
  export default value;
}
