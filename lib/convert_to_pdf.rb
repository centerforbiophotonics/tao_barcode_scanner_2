module ConvertToPdf
 
  def generate_registrants(id, name)
    require 'barby'
    require 'barby/barcode/code_128'
    require 'barby/outputter/png_outputter'
    require 'chunky_png'
    require 'pdfkit'

    barcode = Barby::Code128.new(id)

    png = Barby::PngOutputter.new(barcode).to_image.to_data_url

    html = ApplicationController.render(file: Rails.root.join('app/views/tao/template.html.erb'), assigns: {path: Rails.root.join("lib") , name: name, png: png })

    kit = PDFKit.new(html, :page_height => 76.2, :page_width => 101.6, :margin_top => 0, :margin_bottom => 0, :margin_left => 0, :margin_right => 0,
     dpi: 400)

    kit.to_pdf

  end

end

