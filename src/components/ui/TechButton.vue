<template>
  <Button 
    :label="label"
    :icon="icon"
    :severity="severity"
    :outlined="outlined"
    :size="size"
    :class="['tech-button', sizeClass]"
    @click="$emit('click')"
  />
</template>

<script setup>
import Button from 'primevue/button'
import { computed } from 'vue'

const props = defineProps({
  label: String,
  icon: String,
  severity: String,
  outlined: Boolean,
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  }
})

const sizeClass = computed(() => {
  return `tech-button--${props.size}`
})

defineEmits(['click'])
</script>

<style scoped>
.tech-button {
  background: linear-gradient(45deg, var(--primary-500), var(--accent-color));
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  border-radius: 0.75rem;
  position: relative;
  overflow: hidden;
}

.tech-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.tech-button:hover::before {
  left: 100%;
}

.tech-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0, 212, 255, 0.4);
}

.tech-button.p-button-outlined {
  background: transparent;
  border: 2px solid var(--primary-500);
  color: var(--primary-500);
  backdrop-filter: blur(10px);
}

.tech-button.p-button-outlined:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--accent-color);
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0, 212, 255, 0.3);
}

/* Size variants */
.tech-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.tech-button--normal {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.tech-button--large {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  min-height: 3.5rem;
}
</style>
