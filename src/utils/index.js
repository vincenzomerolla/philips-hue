export function xyzToRgb(x, y, bri) {
    let z = 1.0 - x - y;

    let Y = bri / 255.0; // Brightness of lamp
    let X = (Y / y) * x;
    let Z = (Y / y) * z;
    let r = X * 1.612 - Y * 0.203 - Z * 0.302;
    let g = -X * 0.509 + Y * 1.412 + Z * 0.066;
    let b = X * 0.026 - Y * 0.072 + Z * 0.962;
    r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
    let maxValue = Math.max(r,g,b);
    r /= maxValue;
    g /= maxValue;
    b /= maxValue;
    r *= 255;   if (r < 0) { r = 255 };
    g *= 255;   if (g < 0) { g = 255 };
    b *= 255;   if (b < 0) { b = 255 };

    r = Math.round(r).toString(16);
    g = Math.round(g).toString(16);
    b = Math.round(b).toString(16);

    if (r.length < 2)
        r="0"+r;
    if (g.length < 2)
        g="0"+g;
    if (b.length < 2)
        b="0"+r;
    let rgb = "#"+r+g+b;

    return rgb;
}

export function rgbToXyz(rgb) {
  let { r, g, b } = rgb;
  let X, Y, Z, x, y;
  // console.log(color)

  r = +(r/255).toPrecision(2);
  g = +(g/255).toPrecision(2);
  b = +(b/255).toPrecision(2);

  console.log(r,g,b)

  r = (r > 0.04045) ? Math.pow((r + 0.055) / (1.0 + 0.055), 2.4) : (r / 12.92);
  g = (g > 0.04045) ? Math.pow((g + 0.055) / (1.0 + 0.055), 2.4) : (g / 12.92);
  b = (b > 0.04045) ? Math.pow((b + 0.055) / (1.0 + 0.055), 2.4) : (b / 12.92);

  console.log(r,g,b)

  X = r * 0.664511 + g * 0.154324 + b * 0.162028;
  Y = r * 0.283881 + g * 0.668433 + b * 0.047685;
  Z = r * 0.000088 + g * 0.072310 + b * 0.986039;

  console.log(X,Y,Z)

  x = X / (X + Y + Z);
  y = Y / (X + Y + Z);

  console.log(x,y)
  return { x, y, z: Y };
}
