<template>
  <div class="modelium-orbit">
    <div class="logo-symbol">
      <div class="symbol-core"></div>
      <div class="symbol-ring"></div>
    </div>
    <div class="orbit-visual">
      <div class="central-core">AI</div>
      <div class="orbit orbit-1"><div class="orbit-node node-1">ML</div></div>
      <div class="orbit orbit-2"><div class="orbit-node node-2">DL</div></div>
      <div class="orbit orbit-3"><div class="orbit-node node-3">NN</div></div>
    </div>
    <div class="logo-text">
      <span class="text-primary">Modelium</span>
      <span class="text-secondary">AI Platform</span>
    </div>
  </div>
</template>

<script setup>
// No logic needed
</script>

<style scoped>
.modelium-orbit {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 3;
}
.logo-symbol {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 0.5rem;
}
.symbol-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #00d4ff, #7c3aed);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}
.symbol-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00d4ff;
  animation: spin 8s linear infinite;
}
.orbit-visual {
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: 0.5rem;
}
.central-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 212, 255, 0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  z-index: 2;
  border: 2px solid #00d4ff;
  box-shadow: 0 0 12px #00d4ff44;
}
.orbit {
  position: absolute;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.orbit-1 {
  width: 90px;
  height: 90px;
  animation: rotate 12s linear infinite;
}
.orbit-2 {
  width: 130px;
  height: 130px;
  animation: rotate 18s linear infinite reverse;
}
.orbit-3 {
  width: 170px;
  height: 170px;
  animation: rotate 24s linear infinite;
}
.orbit-node {
  position: absolute;
  width: 32px;
  height: 32px;
  background: rgba(42, 42, 60, 0.9);
  border: 2px solid #8b5cf6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #8b5cf6;
  font-size: 0.85rem;
  box-shadow: 0 0 10px #8b5cf6aa;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    system-ui,
    sans-serif;
}
.node-1 {
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
}
.node-2 {
  top: 50%;
  right: -16px;
  transform: translateY(-50%);
}
.node-3 {
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
}
.logo-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.text-primary {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}
.text-secondary {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
