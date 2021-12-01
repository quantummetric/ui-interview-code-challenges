import React, { useEffect, useState } from "react";

const MousePosition: React.FC = () => {
  const [position, setPosition] = useState<string>('');

  useEffect(() => {
    document.addEventListener('mousemove', (event: MouseEvent) => {
      setPosition(`${event.clientX}, ${event.clientY}`);
    });
  }, []);

  return (
    <p>Mouse Position: {position}</p>
  );
};

MousePosition.displayName = "MousePosition";
export default MousePosition;
