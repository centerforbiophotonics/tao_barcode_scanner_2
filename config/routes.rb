Rails.application.routes.draw do
  root to: 'tao#app'
  get 'tao/app'
  get 'tao/workshops'
  get 'tao/print'
  get 'tao/help'
  get 'users/user'
  get 'users', to: 'users#user'
  post 'tao/generate_pdf'
  post 'tao/attend'
end
