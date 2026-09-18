export function Lights() {
  return (
    <group>
      <ambientLight intensity={0.55} />

      {/* Luz del día por la ventana */}
      <directionalLight
        position={[-7, 10, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0002}
      />

      {/* Plafón central */}
      <pointLight position={[0, 2.9, 0]} intensity={9} distance={11} decay={2} color="#fff2dd" />

      {/* Lámpara de pie */}
      <pointLight position={[3.3, 2.4, -2.9]} intensity={5} distance={8} decay={2} color="#ffd9a0" />
    </group>
  )
}