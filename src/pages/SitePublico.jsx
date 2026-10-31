import Header from '../components/Header'
import Hero from '../components/Hero'
import Sobre from '../components/Sobre'
import Galeria from '../components/Galeria'
import Formulario from '../components/Formulario'
import Footer from '../components/Footer'

export default function SitePublico() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Sobre />
        <Galeria />
        <Formulario />
      </main>
      <Footer />
    </>
  )
}