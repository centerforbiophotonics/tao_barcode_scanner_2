Rails.application.routes.draw do
  root to: 'tao#app'
  get 'tao/app'
  get 'tao/workshops'
  get 'tao/print'
  get 'tao/help'
  get 'users/user'
  get 'users', to: 'users#user'
  post 'users/add'
  post 'users/update'
  post 'users/delete'
  post 'tao/generate_pdf'
  post 'tao/attend'
end
