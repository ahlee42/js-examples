import dynamic from 'next/dynamic'

const Game = () => {
  const DynamicComponentWithNoSSR = dynamic(
    () => import('../game/App'),
    { ssr: false }
  )
  return (
    <div>
        <DynamicComponentWithNoSSR />
        <p>HOME PAGE is here!</p>
    </div>
   )
};

export default Game;