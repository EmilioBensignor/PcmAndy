export default defineNuxtPlugin(async () => {
  if (process.server) return

  await nextTick()
  
  try {
    const [
      { useColoresStore },
      { useCategoriasStore }
    ] = await Promise.all([
      import('~/store/colores'),
      import('~/store/categorias')
    ])
    
    const coloresStore = useColoresStore()
    const categoriasStore = useCategoriasStore()
    
    const needsColores = coloresStore.colores.length === 0
    const needsCategorias = categoriasStore.categorias.length === 0
    
    if (!needsColores && !needsCategorias) {
      console.log('🚀 Datos ya precargados en stores')
      return
    }
    
    const promises = []
    
    if (needsColores) {
      promises.push(coloresStore.fetchColores())
    }
    
    if (needsCategorias) {
      promises.push(categoriasStore.fetchCategorias())
    }
    
    await Promise.all(promises)
    
    console.log('✅ Datos precargados exitosamente:', {
      colores: coloresStore.colores.length,
      categorias: categoriasStore.categorias.length
    })
    
  } catch (error) {
    console.warn('⚠️ Error precargando datos:', error.message)
  }
})