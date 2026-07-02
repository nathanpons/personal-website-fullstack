from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pytest
from conftest import BASE_URL


SOLAR_URL = BASE_URL + "/projects/solarsystem"

@pytest.mark.smoke
def test_solar_system_initialization(driver):
    driver.get(SOLAR_URL)
    canvas = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "canvas-container"))
    )
    assert canvas is not None, "Canvas should be visible on the solar system page"

@pytest.mark.smoke
def test_solar_system_has_control_bar(driver):
    driver.get(SOLAR_URL)
    control_bar = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "control-bar"))
    )
    assert control_bar is not None, "Control bar should be visible on the solar system page"









