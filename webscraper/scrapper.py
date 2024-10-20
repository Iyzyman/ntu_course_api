from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import UnexpectedAlertPresentException, NoAlertPresentException, TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import pandas as pd
import time

# Initialize WebDriver
driver_path = '/Users/hemanthchezhian/Desktop/Adv-Software-Eng/chromedriver-mac-arm64/chromedriver'  # Update with your path to ChromeDriver
service = Service(driver_path)
driver = webdriver.Chrome(service=service)

try:
    print("Navigating to the courses page...")
    # Navigate to the courses page
    url = 'https://wis.ntu.edu.sg/webexe/owa/aus_subj_cont.main'  
    driver.get(url)
    print("Page loaded successfully.")

    print("Waiting for the dropdown to be present...")
    # Wait for the dropdown to be present
    wait = WebDriverWait(driver, 30)
    dropdown = wait.until(EC.presence_of_element_located((By.NAME, 'r_course_yr')))
    print("Dropdown found.")

    # Initialize Select
    select = Select(dropdown)

    # Get all dropdown options
    options = select.options
    print(f"Found {len(options)} options in the dropdown.")

    # List to hold all course data
    courses_data = []

    for option in options:
        value = option.get_attribute('value')
        text = option.text.strip()
        print(f"Processing option: {text}")

        # Skip the placeholder, empty option, and "---Double Degree---" options
        if not text or text == "---Select an Option---" or "---Double Degree---" in text:
            print(f"Skipping option: {text}")
            continue

        # Process the courses for Materials Engineering And Economics Year 5
        if "Materials Engineering And Economics Year 5" in text:
            print("Processing and stopping at Materials Engineering And Economics Year 5...")

        try:
            # Select the dropdown option
            select.select_by_value(value)
            print(f"Selected option: {text}")

            # Locate the "Load Content of Course(s)" button by its value attribute and click it
            print("Looking for the 'Load Content of Course(s)' button...")
            load_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@type='button' and @value='Load Content of Course(s)']")))
            load_button.click()
            print(f"'Load Content of Course(s)' button clicked for option: {text}")

            # Switch to the iframe that contains the course content
            print("Switching to iframe...")
            iframe = driver.find_element(By.NAME, "subjects")
            driver.switch_to.frame(iframe)

            # Increase the wait time for the course data to load
            wait = WebDriverWait(driver, 60) 
            print("Course data loaded in iframe.")

            # Parse the iframe page source
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            print("Iframe content parsed with BeautifulSoup.")

            # Find all the rows in the table that contain course information
            course_rows = soup.find_all('tr')
            for i, row in enumerate(course_rows):
                try:
                    code_element = row.find('td', width="100")
                    if code_element and "font" in str(code_element):
                        course_code = code_element.find('font').get_text(strip=True)

                        # Ensure this is not a "Prerequisite" or other detail row
                        if not course_code.startswith("Prerequisite") and not course_code.startswith("Grade Type"):
                            course_title = row.find('td', width="500").find('font').get_text(strip=True)

                            # Extract the AUs
                            au_elements = row.find_all('td', width="50")
                            if au_elements:
                                au = au_elements[0].find('font').get_text(strip=True)
                            else:
                                au = "N/A"  # Assign "N/A" if AU is not found

                            # Attempt to extract the description from the subsequent row(s)
                            description = ""
                            for desc_row in course_rows[i + 1:]:
                                description_element = desc_row.find('td', width="650")
                                if description_element:
                                    description = description_element.find('font').get_text(strip=True)
                                    break
                            
                            # Try to find prerequisite information
                            prerequisite = "N/A"
                            prerequisite_row = row.find_next('td', text='Prerequisite:')
                            if prerequisite_row:
                                prerequisite = prerequisite_row.find_next('td').find('font').get_text(strip=True)
                            
                            print(f"Extracted data for course: {course_code} - {course_title} - {au} - Prerequisite: {prerequisite}")

                            # Append to the data list
                            courses_data.append({
                                'Category': text,
                                'Course Code': course_code,
                                'Course Title': course_title,
                                'AUs': au,
                                'Description': description,
                                'Prerequisite': prerequisite  
                            })
                except AttributeError:
                    # If the row doesn't match the expected structure, skip it
                    continue
                except IndexError:
                    # If there's an issue with indexing (like a missing description), skip it
                    print(f"Warning: Skipped course with missing description at index {i}.")
                    continue

            # Switch back to the default content (main page)
            driver.switch_to.default_content()

        except TimeoutException:
            print(f"Timed out waiting for course data to load for option: {text}")
        except NoSuchElementException as e:
            print(f"Error: {e} - Element not found for option: {text}")
        except NoAlertPresentException:
            print(f"No alert present for option: {text}")
        except UnexpectedAlertPresentException as e:
            print(f"Alert present for option: {text}, dismissing the alert.")
            alert = driver.switch_to.alert
            alert.dismiss()
        except AttributeError as e:
            print(f"Error extracting data for option {text}: {e}")
            continue

        # Stop after processing "Materials Engineering And Economics Year 5"
        if "Materials Engineering And Economics Year 5" in text:
            print("Completed extraction for Materials Engineering And Economics Year 5. Stopping now.")
            break

    print("All options processed. Saving data to CSV...")
    # Convert to DataFrame and save
    df = pd.DataFrame(courses_data)
    df.to_csv('university_courses_v2.csv', index=False, encoding='utf-8')
    print("Scraping completed and data saved to 'university_courses_v2.csv'")

finally:
    # Ensure the driver is closed even if an error occurs
    print("Closing the browser...")
    driver.quit()
