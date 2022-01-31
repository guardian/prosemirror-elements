export const htmlLength = (text: string) => {
  const el = document.createElement("div");
  el.innerHTML = text;
  return el.innerText.length;
};
