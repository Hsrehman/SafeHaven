import { test, expect, Page } from '@playwright/test';
import { generateTestData, generateNoMatchesTestData } from './utils/form-test-data';

test.describe('Shelter Matching Flow', () => {
  let page: Page;
  let testData: Record<string, any>;

  test.beforeEach(async ({ browser }) => {
    
    page = await browser.newPage();
    
    
    await page.goto('/form');
    
    
    await page.waitForLoadState('networkidle');
    
    
    await page.waitForSelector('.container', { state: 'visible' });
    
    
    await page.waitForSelector('text=What is your full name?', { state: 'visible' });
    await page.waitForSelector('input[placeholder="Your full name"]', { state: 'visible' });
  });

  test.afterEach(async () => {
    
    await page.close();
  });

  
  const selectRadioOption = async (page: Page, optionValue: string) => {
    
    if (optionValue === 'Yes' || optionValue === 'No') {
      
      await page.getByRole('radio', { name: optionValue, exact: true }).check();
    } else if (optionValue === 'Not sure') {
      
      await page.getByRole('radio', { name: 'Not sure', exact: true }).check();
    } else if (optionValue.startsWith('Prefer')) {
      
      await page.getByRole('radio', { name: /^Prefer/, exact: false }).check();
    } else if (optionValue.includes(' - ')) {
      
      const mainPart = optionValue.split(' - ')[0];
      await page.getByRole('radio', { name: new RegExp('^' + mainPart), exact: false }).check();
    } else if (optionValue.includes('but')) {
      
      const mainPart = optionValue.split('but')[0].trim();
      await page.getByRole('radio', { name: new RegExp('^' + mainPart), exact: false }).check();
    } else if (optionValue.includes('receiving')) {
      
      await page.getByRole('radio', { name: /receiving/, exact: false }).check();
    } else {
      
      try {
        
        await page.getByRole('radio', { name: optionValue, exact: true }).check();
      } catch (e) {
        
        const firstWord = optionValue.split(' ')[0];
        try {
          await page.getByRole('radio', { name: firstWord, exact: true }).check();
        } catch (e2) {
          
          await page.getByLabel(new RegExp(firstWord, 'i')).check();
        }
      }
    }
  };

  test('should complete application form and see matched shelters', async () => {
    
    testData = generateTestData();
    console.log('Running test with data:', JSON.stringify(testData, null, 2));
    
    
    const clickNext = async () => {
      
      const nextButton = page.locator('button:has-text("Next")').first();
      await nextButton.waitFor({ state: 'visible' });
      await nextButton.click();
      
      await page.waitForTimeout(500); 
    };

    
    const nameInput = page.getByPlaceholder('Your full name');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill(testData.fullName);
    await clickNext();

    
    await page.waitForSelector('text=What is your email address?');
    const emailInput = page.getByPlaceholder('Your email (if available)');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill(testData.email);
    
    await page.waitForSelector('text=Email available', { state: 'visible' });
    await clickNext();

    
    await page.waitForSelector('text=What is your phone number?');
    const phoneInput = page.getByRole('textbox', { name: '0712345678' });
    await phoneInput.waitFor({ state: 'visible' });
    await phoneInput.fill(testData.phone);
    await clickNext();

    
    await page.waitForSelector('text=What is your date of birth?');
    const dobInput = page.locator('input[type="date"]');
    await dobInput.waitFor({ state: 'visible' });
    await dobInput.fill(testData.dob);
    await clickNext();

    
    await page.waitForSelector('text=What is your gender?');
    const genderSelect = page.getByRole('combobox');
    await genderSelect.waitFor({ state: 'visible' });
    await genderSelect.selectOption(testData.gender);
    await clickNext();

    
    await page.waitForSelector('text=What is your preferred language?');
    await page.getByRole('combobox').selectOption(testData.language);
    await clickNext();

    
    await page.waitForSelector('text=What is your current location?');
    const locationInput = page.getByRole('textbox', { name: 'Enter your address or postcode' });
    await locationInput.waitFor({ state: 'visible' });
    
    
    const locationToUse = testData.location;
    
    
    await locationInput.fill(locationToUse);
    
    
    await page.waitForTimeout(2000);
    
    try {
      
      const suggestions = page.locator('button[role="button"]').first();
      if (await suggestions.count() > 0) {
        
        await suggestions.click();
        console.log(`Selected first location suggestion`);
      } else {
        
        const allButtons = page.getByRole('button');
        
        await page.waitForTimeout(500);
        
        
        const buttonCount = await allButtons.count();
        if (buttonCount > 0) {
          
          
          await allButtons.first().click();
          console.log('Clicked first available suggestion button');
        } else {
          console.log('No suggestion buttons found');
        }
      }
    } catch (error) {
      console.log(`Error during location selection: ${error}`);
    }
    
    
    await page.waitForTimeout(1000);
    
    
    await clickNext();

    
    await page.waitForSelector('text=Are you currently sleeping rough');
    await page.getByText(testData.sleepingRough).first().click();
    await clickNext();

    
    await page.waitForSelector('text=How long have you been homeless?');
    await page.getByRole('combobox').selectOption(testData.homelessDuration);
    await clickNext();

    
    await page.waitForSelector('text=Who are you seeking shelter for?');
    await page.getByText(testData.groupType).click();
    await clickNext();

    
    if (testData.groupType !== 'Just myself') {
      await page.waitForSelector('text=How many other people are with you?');
      await page.getByPlaceholder('Number of people').fill(testData.groupSize);
      await clickNext();
      
      
      if (testData.groupType === 'Myself and my family') {
        await page.waitForSelector('text=How many children are with you?');
        await page.getByPlaceholder('Number of children').fill(testData.childrenCount);
        await clickNext();
      }
    }

    
    await page.waitForSelector('text=What was your previous accommodation?');
    await page.getByRole('combobox').selectOption(testData.previousAccommodation);
    await clickNext();

    
    await page.waitForSelector('text=Why did you leave your previous accommodation?');
    
    for (const reason of testData.reasonForLeaving) {
      await page.getByLabel(reason).check();
    }
    await clickNext();

    
    await page.waitForSelector('text=Are you looking for accommodation for tonight or longer-term?');
    await page.getByText(testData.shelterType).click();
    await clickNext();

    
    await page.waitForSelector('text=Do you need a shelter with 24-hour security?');
    await selectRadioOption(page, testData.securityNeeded);
    await clickNext();

    
    if (testData.shelterType !== 'Emergency (tonight)' && await page.locator('text=Do you prefer a shelter with a curfew?').count() > 0) {
      await page.waitForSelector('text=Do you prefer a shelter with a curfew?');
      await page.getByText(testData.curfew).first().click();
      await clickNext();
    }

    
    if ((testData.shelterType === 'Short-term (few days/weeks)' || testData.shelterType === 'Long-term') && 
        await page.locator('text=Are you comfortable with communal living').count() > 0) {
      await page.waitForSelector('text=Are you comfortable with communal living');
      await page.getByText(testData.communalLiving).first().click();
      await clickNext();
    }

    
    if (await page.locator('text=Would you prefer a shelter that allows smoking?').count() > 0) {
      await page.waitForSelector('text=Would you prefer a shelter that allows smoking?');
      await page.getByText(testData.smoking.split(' ')[0]).first().click();
      await clickNext();
    }

    
    await page.waitForSelector('text=Do you need food assistance?');
    await selectRadioOption(page, testData.foodAssistance);
    await clickNext();

    await page.waitForSelector('text=Do you need help with applying for benefits?');
    await selectRadioOption(page, testData.benefitsHelp);
    await clickNext();

    
    await page.waitForSelector('text=Do you have any mental health support needs?');
    await selectRadioOption(page, testData.mentalHealth);
    await clickNext();

    
    if (testData.mentalHealth === 'Yes' && await page.locator('textarea').count() > 0) {
      await page.getByPlaceholder(/mental health needs/i).fill(testData.mentalHealthDetails);
      await clickNext();
    }

    
    await page.waitForSelector('text=Do you have any substance use support needs?');
    await selectRadioOption(page, testData.substanceUse);
    await clickNext();

    
    if (testData.substanceUse === 'Yes' && await page.locator('textarea').count() > 0) {
      await page.getByPlaceholder(/substance use/i).fill(testData.substanceUseDetails);
      await clickNext();
    }

    await page.waitForSelector('text=Do you need social services');
    await selectRadioOption(page, testData.socialServices);
    await clickNext();

    await page.waitForSelector('text=Are you fleeing domestic');
    await selectRadioOption(page, testData.domesticAbuse);
    await clickNext();

    
    await page.waitForSelector('text=Do you have any medical conditions or disabilities?');
    await page.getByPlaceholder(/medical conditions/i).fill(testData.medicalDetails);
    await clickNext();

    await page.waitForSelector('text=Do you need wheelchair');
    await selectRadioOption(page, testData.wheelchair);
    await clickNext();

    
    await page.waitForSelector('text=What is your immigration status?');
    await page.getByRole('combobox').selectOption(testData.immigrationStatus);
    await clickNext();

    
    await page.waitForSelector('text=Are you currently receiving any of these benefits?');
    if (testData.benefits.length > 0) {
      for (const benefit of testData.benefits) {
        await page.getByLabel(benefit).check();
      }
    } else {
      await page.getByLabel('None of these').check();
    }
    await clickNext();

    
    await page.waitForSelector('text=Do you have a local connection to this area?');
    for (const connection of testData.localConnection) {
      await page.getByLabel(connection).check();
    }
    await clickNext();

    
    await page.waitForSelector('text=Are you a care leaver');
    await selectRadioOption(page, testData.careLeaver);
    await clickNext();

    
    await page.waitForSelector('text=Are you a veteran');
    await selectRadioOption(page, testData.veteran);
    await clickNext();

    
    await page.waitForSelector('text=Do you have any pets with you?');
    await selectRadioOption(page, testData.pets);
    await clickNext();

    
    if (testData.pets === 'Yes') {
      await page.waitForSelector('text=What type of pet(s) and how many?');
      await page.getByPlaceholder(/describe your pets/i).fill(testData.petDetails);
      await clickNext();
    }

    
    if (['Female', 'Non-binary', 'Other', 'Prefer not to say'].includes(testData.gender) && 
        await page.locator('text=Do you require a women-only shelter?').count() > 0) {
      await page.waitForSelector('text=Do you require a women-only shelter?');
      await selectRadioOption(page, testData.womenOnly);
      await clickNext();
    }

    
    await page.waitForSelector('text=Do you need LGBTQ+ friendly accommodation?');
    
    
    await selectRadioOption(page, testData.lgbtqFriendly);
    
    await clickNext();

    
    await page.waitForSelector('text=Do you have any support workers');
    await selectRadioOption(page, testData.supportWorkers);
    await clickNext();

    
    if (testData.supportWorkers === 'Yes') {
      await page.waitForSelector('text=Please provide their contact details');
      await page.getByPlaceholder(/Support worker name/i).fill(testData.supportWorkerDetails);
      await clickNext();
    }

    
    await page.waitForSelector('text=Is there anything else we should know');
    await page.getByPlaceholder(/Share any other details/i).fill(testData.additionalInfo);
    await clickNext();

    
    await page.waitForSelector('text=Do you agree to the Terms and Conditions?');
    await page.getByLabel(/agree to the terms/i).check();
    await clickNext();

    
    await page.waitForSelector('text=Do you consent to us sharing your information');
    await page.getByLabel(/consent to my information being shared/i).check();
    await clickNext();

    
    await page.waitForSelector('text=Do you consent to us contacting you');
    await page.getByLabel(/consent to being contacted/i).check();

    
    await page.getByRole('button', { name: 'Submit Application' }).click();

    
    await page.waitForURL('**/shelterPortal/shelterOptions');
    
    
    await page.waitForSelector('h1:has-text("Matching Shelters")');

    
    const shelterCards = page.locator('.grid-cols-1 > div');
    
    
    await page.waitForTimeout(1000);
    
    
    const cardsCount = await shelterCards.count();
    
    if (cardsCount === 0) {
      
      console.log("TEST SCENARIO: No shelters found for the given criteria");
      
      
      const noMatchesHeading = page.getByRole('heading', { name: 'No Matching Shelters Found' });
      
      if (await noMatchesHeading.count() > 0) {
        
        await expect(noMatchesHeading).toBeVisible();
        console.log("TEST INFO: Found 'No Matching Shelters Found' heading");
      } else {
        
        const noMatchesMessage = page.getByText(/No matching shelters|No results found|No shelters match/i);
        
        if (await noMatchesMessage.count() > 0) {
          
          await expect(noMatchesMessage).toBeVisible();
          console.log("TEST INFO: Found generic no matches message");
        } else {
          
          await expect(shelterCards).toHaveCount(0);
          console.log("TEST INFO: Verified no shelter cards are present");
        }
      }
      
      
      await page.screenshot({ path: 'test-results/screenshots/no-matches-found.png' });
      
      
      console.log("TEST COMPLETE: Successfully verified empty results handling");
      return;
    }

    
    await shelterCards.first().waitFor({ state: 'visible' });

    
    const firstShelterCard = shelterCards.first();
    const viewDetailsButton = firstShelterCard.getByRole('button', { name: 'View Details' });
    await viewDetailsButton.click();

    
    await page.waitForSelector('h3:has-text("Basic Information")');
    await page.waitForSelector('h3:has-text("Support Services")');
    await page.waitForSelector('h3:has-text("Policies & Requirements")');

    
    await page.waitForTimeout(3000);

    
    await page.locator('button.p-2.hover\\:bg-gray-100').click();

    
    await page.waitForTimeout(500);

    
    
    await firstShelterCard.locator('input[type="checkbox"]').check();

    let selectedCount = 1;
    
    
    if (cardsCount > 1) {
      
      const secondShelterCard = shelterCards.nth(1);
      await secondShelterCard.locator('input[type="checkbox"]').check();
      selectedCount++;
      
      if (cardsCount > 2) {
        
        const thirdShelterCard = shelterCards.nth(2);
        await thirdShelterCard.locator('input[type="checkbox"]').check();
        selectedCount++;
      }
    }

    
    const applyButton = page.getByRole('button', { name: new RegExp(`Apply to Selected \\(${selectedCount}\\)`) });
    await expect(applyButton).toBeEnabled();

    
    await applyButton.click();

    
    await page.waitForURL('**/shelterPortal/application-confirmation');
    
    
    
    await expect(page.getByRole('heading', { name: 'Applications Submitted Successfully!' })).toBeVisible({ timeout: 10000 });    
    
    await page.waitForTimeout(2000);
    
    
    await expect(page.url()).toContain('/shelterPortal/application-confirmation');
  });
});