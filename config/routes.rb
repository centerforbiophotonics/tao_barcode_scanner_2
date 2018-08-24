Rails.application.routes.draw do
  resources :users, only: [:index, :create, :update, :destroy] do
    collection do
      get :search
      post :set_event_server
    end
  end
  
  root to: 'events#home'

  get 'events/home'
  get 'events/scanner'
  get 'events/workshops'
  get 'events/print'
  get 'events/help'
  post 'events/generate_pdf'
  post 'events/attend'
end
