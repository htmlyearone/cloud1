Rails.application.routes.draw do
      devise_for :users
      resources :patients
      resources :users, only: :index
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  
      resources :users
      root 'patients#index'
       get '/illness', :controller=>'patients', :action=>'illness'
    post '/checkpat', :controller=>'patients', :action=>'check'
end

Rails.application.routes.draw do
  mount ReportsKit::Engine, at: '/'
  # ...
end