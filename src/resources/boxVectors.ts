export const boxW: number = 9;
export const boxVertices =
  [ // X, Y, Z 
    // Top
    -boxW, boxW, -boxW,
    -boxW, boxW, boxW,
    boxW, boxW, boxW,
    boxW, boxW, -boxW,

    // Left
    -boxW, boxW, boxW,
    -boxW, -boxW, boxW,
    -boxW, -boxW, -boxW,
    -boxW, boxW, -boxW,

    // Right
    boxW, boxW, boxW,
    boxW, -boxW, boxW,
    boxW, -boxW, -boxW,
    boxW, boxW, -boxW,

    // Front
    boxW, boxW, boxW,
    boxW, -boxW, boxW,
    -boxW, -boxW, boxW,
    -boxW, boxW, boxW,

    // Back
    boxW, boxW, -boxW,
    boxW, -boxW, -boxW,
    -boxW, -boxW, -boxW,
    -boxW, boxW, -boxW,

    // Bottom
    -boxW, -boxW, -boxW,
    -boxW, -boxW, boxW,
    boxW, -boxW, boxW,
    boxW, -boxW, -boxW,
  ];

export const boxTextST =
  [ 
//->S  T
    // Top
    0, 0,
    0, 1,
    1, 1,
    1, 0,

    // Left
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Right
    1, 1,
    0, 1,
    0, 0,
    1, 0,

    // Front
    1, 1,
    1, 0,
    0, 0,
    0, 1,

    // Back
    0, 0,
    0, 1,
    1, 1,
    1, 0,

    // Bottom
    1, 1,
    1, 0,
    0, 0,
    0, 1,
  ];

export const boxIndices =
  [
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23
  ];