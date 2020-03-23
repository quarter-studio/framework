import Container from './Container'
import Listener from './Listener'

export default (config = {}) => {
  const app = {
    ...Container(),
    ...Listener(),
  }

  app.share('config', config)

  return app
}
