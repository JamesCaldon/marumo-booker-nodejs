import webdriver, { By, until } from 'selenium-webdriver';
import { pino } from 'pino';
const logger = pino();
export class BookingBot {
    driver;
    constructor() {
        this.driver = new webdriver.Builder().forBrowser('chrome').build();
    }
    async selectDropdownOption(option, optionNumber) {
        const itemSelectionDropdown = await this.driver.wait(until.elementLocated(By.id(`${option}Container`)), 10000);
        const secondOption = await itemSelectionDropdown.findElement(By.css(`#${option}Options > li[id="${optionNumber}"]`));
        await this.driver.actions().click(itemSelectionDropdown).click(secondOption).perform();
    }
    async captureSourceAndScreenshot() {
    }
    async enterFormField(submissionForm, id, value) {
        const field = await submissionForm.findElement(By.css(`input[id="${id}"]`));
        await field.sendKeys(value);
    }
    async initialiseSite() {
        try {
            // Head to the Marumo bookign site
            await this.driver.get('https://obee.com.au/pipitrestaurant');
            // page 1, enter number of people and date - once date is selected then enter time.
            await this.selectDropdownOption('select_areaSelectBoxIt', '2');
            await this.driver.sleep(1000);
            await this.selectDropdownOption('select_bsizeSelectBoxIt', '2');
            // We know that Dan wants to select a date next month, and we know by default it will default to the current date.
            // But let's do a check, just in case.
            const currentSelectedMonth = await (await this.driver.findElement(By.className('ui-datepicker-month'))).getText();
            if (currentSelectedMonth !== 'September') {
                // If the currently selected month is not september
                const forwardDateButton = await this.driver.findElement(By.className('ui-datepicker-next ui-corner-all'));
                await this.driver.actions().click(forwardDateButton).perform();
                await this.driver.sleep(1000);
            }
            // select date
            const datepicker = await this.driver.findElement(By.className('ui-datepicker-calendar'));
            const selectedDate = await datepicker.findElement(By.xpath('//*[text()="18"]'));
            await this.driver.actions().click(selectedDate).perform();
            await this.driver.sleep(1000);
            //select time
            const timeSelectionDropdown = await this.driver.wait(until.elementLocated(By.id(`select_timeSelectBoxItContainer`)), 10000);
            const timeOption = await timeSelectionDropdown.findElement(By.css(`#select_timeSelectBoxItOptions > li[data-val="18:30"]`));
            await this.driver.actions().click(timeSelectionDropdown).click(timeOption).perform();
            // Submit
            const stepOneSubmitButton = await this.driver.findElement(By.id('step1submit'));
            await this.driver.actions().click(stepOneSubmitButton).perform();
            // page 2 - Marumo may not have a page 2, that is fine, let's assume that it does.
            const step2SubmitButton = await this.driver.findElement(By.id('step1bsubmit'));
            await this.driver.actions().click(step2SubmitButton).perform();
            // page 3 - details
            const submissionForm = await this.driver.findElement(By.id('details'));
            await this.enterFormField(submissionForm, 'name', 'Daniel');
            await this.enterFormField(submissionForm, 'surname', 'Ku');
            await this.enterFormField(submissionForm, 'mobile', '435453732');
            await this.enterFormField(submissionForm, 'step2-email', 'nickholas.yong@gmail.com');
            const step3SubmitButton = await this.driver.findElement(By.id('step2confirm'));
            await this.driver.actions().click(step3SubmitButton).perform();
            // page 4 - card info
            await this.driver.switchTo().frame(0);
            const input = await this.driver.findElement(By.id('thisField'));
            await input.sendKeys('adklaldad');
            await this.driver.switchTo().parentFrame();
        }
        catch (e) {
            logger.error({ e }, 'Error in initialiseSite()');
        }
    }
}
