<template>
  <div class="landing-page">
    <NavBar />
    <HeroSection />
    <FeaturesSection />
    <CTASection />
    <FooterSection />
  </div>
</template>

<script setup>
import NavBar from '@/components/layout/NavBar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import CTASection from '@/components/landing/CTASection.vue'
import FooterSection from '@/components/landing/FooterSection.vue'
</script>

<style scoped>
.landing-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
}
</style>
