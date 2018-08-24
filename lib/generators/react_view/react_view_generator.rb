class ReactViewGenerator < Rails::Generators::NamedBase
  include  Rails::Generators::ResourceHelpers
  
  source_root File.expand_path('templates', __dir__)

  class_option :orm, banner: "NAME", type: :string, required: true,
                         desc: "ORM to generate the controller for"

  argument :attributes, type: :array, default: [], banner: "field:type field:type"

  def generate_controller
    template_file = "controller.rb"
    template template_file, File.join("app/controllers", controller_class_path, "#{controller_file_name}_controller.rb")
  end

  def insert_routes
    insert_into_file "config/routes.rb",
"  resources :#{plural_table_name}, only: [:index, :create, :update, :destroy] do
    collection do
      get :search
    end
  end
",
                     :after => "Rails.application.routes.draw do\n" 
  end

  def generate_index_component
    template_file = "index_template.jsx"
    template template_file, File.join("app/javascript/components/#{controller_file_name}", controller_class_path, "#{controller_file_name}.jsx")
  end

  def generate_show_component
    template_file = "show_template.jsx"
    template template_file, File.join("app/javascript/components/#{controller_file_name}", controller_class_path, "#{singular_table_name}.jsx")
  end

  def generate_form_component
    template_file = "form_template.jsx"
    template template_file, File.join("app/javascript/components/#{controller_file_name}", controller_class_path, "#{singular_table_name}_form.jsx")
  end

  def generate_search_component
    template_file = "search_template.jsx"
    template template_file, File.join("app/javascript/components/#{controller_file_name}", controller_class_path, "#{singular_table_name}_search.jsx")
  end

  def generate_list_component
    template_file = "list_template.jsx"
    template template_file, File.join("app/javascript/components/#{controller_file_name}", controller_class_path, "#{singular_table_name}_list.jsx")
  end

  def register_root_component
    insert_into_file "app/javascript/packs/application.js",
                     "import #{controller_class_name} from 'components/#{controller_file_name}/#{plural_table_name}';\n\n",
                     :before => "import WebpackerReact from 'webpacker-react';" 

    append_to_file "app/javascript/packs/application.js" do 
      "\nWebpackerReact.setup({#{controller_class_name}});"
    end
  end

  def generate_index_view
    template_file = "index.html.erb"
    template template_file, File.join("app/views/#{controller_file_name}", controller_class_path, "index.html.erb")
  end
end
