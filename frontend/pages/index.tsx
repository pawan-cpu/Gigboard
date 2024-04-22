import dynamic from 'next/dynamic'
const DynamicLanding = dynamic(() => import('../components/Landing'), {
  ssr: false,
})

export default DynamicLanding;