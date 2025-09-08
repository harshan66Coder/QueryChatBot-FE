export const generateMonochromeColors = (baseColor, count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const factor = 1 - i * 0.1; 
    colors.push(shadeColor(baseColor, factor));
  }
  return colors;
};

function shadeColor(color, factor) {
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);

  r = Math.min(255, Math.floor(r * factor));
  g = Math.min(255, Math.floor(g * factor));
  b = Math.min(255, Math.floor(b * factor));

  return `rgb(${r},${g},${b})`;
}
