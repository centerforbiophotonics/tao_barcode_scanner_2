require 'test_helper'

class TaoControllerTest < ActionDispatch::IntegrationTest
  test "should get app" do
    get tao_app_url
    assert_response :success
  end

  test "should get workshops" do
    get tao_workshops_url
    assert_response :success
  end

  test "should get attend" do
    get tao_attend_url
    assert_response :success
  end

end
