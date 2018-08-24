require 'test_helper'

class EventsControllerTest < ActionDispatch::IntegrationTest
  test "should get scanner" do
    get events_scanner_url
    assert_response :success
  end

  test "should get workshops" do
    get events_workshops_url
    assert_response :success
  end

  test "should get attend" do
    get events_attend_url
    assert_response :success
  end

end
