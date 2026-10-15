// src/components/common/AnimalPhoto.tsx
// 动物照片：图片加载失败（比如还没下载）时，显示名字首字母作为占位

import { useState } from "react";

interface AnimalPhotoProps {
  src: string;
  name: string;
  className?: string; // 由使用方决定尺寸和圆角
}

export default function AnimalPhoto({ src, name, className = "" }: AnimalPhotoProps) {
  // 你的第一个 useState：记住“图片是否加载失败”
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={
          "flex items-center justify-center bg-teal-100 font-semibold text-teal-700 " + className
        }
      >
        {name[0]}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={"object-cover " + className}
    />
  );
}
