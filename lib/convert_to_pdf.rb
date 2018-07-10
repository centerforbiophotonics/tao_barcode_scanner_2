module ConvertToPdf
 
  def generate_registrants(id, name)
    require 'barby'
    require 'barby/barcode/code_128'
    require 'barby/outputter/png_outputter'
    #require 'barby/outputter/code_39'
    require 'chunky_png'
    require 'pdfkit'

    barcode = Barby::Code128.new("99999")
    #barocde2 = Barby::Code39.new("12345")
    #puts "barcode"
    #puts barcode

    #Barby::PngOutputter.new(546456)

    png = Barby::PngOutputter.new(barcode).to_png

    #IO.write(Rails.root.join("lib/temp_qr.png"), png, 'wb')

    File.open(Rails.root.join("lib/temp_qr.png"), 'wb') do |file|
      file.write(png)
    end
    
    html = File.open(Rails.root.join("lib/template.html")).readlines.join("\n")
    html = html.gsub("***", name)
    #html = html.gsub("@@@", html)

    kit = PDFKit.new(html, :page_height => 76.2, :page_width => 101.6, :margin_top => 0, :margin_bottom => 0, :margin_left => 0, :margin_right => 0)

    #file = kit.to_file(Rails.root.join("lib/templace.html")
    kit.to_pdf
  end

end

