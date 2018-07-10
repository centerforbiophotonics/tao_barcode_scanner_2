Rails.application.routes.draw do
  root to: 'tao#app'
  get 'tao/app'
  get 'tao/workshops'
  get 'tao/print'
  #get 'tao/generate_pdf'
  post 'tao/generate_pdf'
  post 'tao/attend'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
