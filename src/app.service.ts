import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Req } from './models/req';
import { Res } from './models/res';
import { User } from './models/user'; // Define the User type (adjust the path)

@Injectable()
export class AppService {

  private url = 'https://beerslot365.com/daftar';
  // private timeout = 10000000;
  private timeout = 100000;

  getHello(): string {
    return 'Hello World!';
  }

  async attack(req: Req) {
    let users = await this.generateRandomUser(req.accounts);
    let res = new Res();
    for (let user of users) {
        console.log(user);
        const options = {
            width: 1920,
            height: 1080
        };

        const randomUseragent = require('random-useragent');
        const useragent = randomUseragent.getRandom(function (ua: any) {
          return ua.browserName === 'Chrome';
        });

        res.message = 'success';
        const browser = await puppeteer.launch({
            headless: false,
            args: [`--window-size=${options.width},${options.height}`]
        });
        let page = await browser.newPage();
        await page.setViewport(options);
        // await page._client.send('Emulation.clearDeviceMetricsOverride');
        await page.setDefaultNavigationTimeout(this.timeout);
        await page.setDefaultTimeout(0);
        await page.setUserAgent(useragent);
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
          });
        });
        await page.setJavaScriptEnabled(true);
        console.log(useragent);
        await Promise.all([
            page.goto(this.url, {waitUntil: 'networkidle2'}),
            page.waitForNavigation()
          ]);
        await page.waitForSelector('.form-daftar', {visible: true});
        console.log('Daftar Form -------------');

        await page.type('#user_name', user.username, { delay: 100 });
        console.log('Input user_name -------------');

        await page.type('#user_pass', user.password, { delay: 100 });
        console.log('Input user_pass -------------');

        await page.type('#user_pass_confirm', user.password, { delay: 100 });
        console.log('Input user_pass_confirm -------------');

        await page.type('#user_email', user.email, { delay: 100 });
        console.log('Input user_email -------------');

        await page.type('#user_phone', user.phone, { delay: 100 });
        console.log('Input user_phone -------------');

        await page.type('#bank_username', user.accountName, { delay: 100 });
        console.log('Input bank_username -------------');

        await page.type('#bank_number', user.accountNumber, { delay: 100 });
        console.log('Input bank_number -------------');

        // Click the submit button by its class name
        await page.click('.btn-submit');
        await page.waitForNavigation({waitUntil: 'networkidle0'});

        const url = await page.url();

        // await page.goto(url+'deposit');
        // console.log('deposit -------------');

        // await page.waitForSelector('form', {visible: true});
        // console.log('Deposit Form -------------');

        // await page.type('#nominal', user.accountNumber, { delay: 100 });
        // console.log('Input nominal -------------');

        // await page.click('button[name="submit_deposit"]');
        // console.log('Click submit_deposit -------------');

        // console.log('Browser url : '+url);
        // await page.goto(url+'/logout');

        // await browser.close();
        // console.log('Close browser -------------');
    }
    return res.getRes();
  }

  async  generateRandomUser(user_count: any) {
    const faker = require('faker');
    const ExcelJS = require('exceljs');
        // Create an array to store the user objects
        const users: User[] = [];

        // Loop user_count times
        for (let i = 0; i < user_count; i++) {
            // Generate random user data
            let username = faker.name.findName();
            let password = faker.internet.password();
            let email = faker.internet.email().toLowerCase();
            let phone = this.generatePhoneNumber();
            let accountNumber = faker.finance.account();
            let accountName = faker.name.findName();
            let depositAmount = this.generateRandom(1, 99);

            // Create a user object with the fields
            let userObject = {
                username,
                password,
                email,
                phone,
                accountNumber,
                accountName,
                depositAmount
            };

            // Push the user object to the array
            users.push(userObject);
        }

        // Write user data to an Excel file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');
        worksheet.columns = [
            { header: 'Username', key: 'username' },
            { header: 'Password', key: 'password' },
            { header: 'Email', key: 'email' },
            { header: 'Phone', key: 'phone' },
            { header: 'Account Number', key: 'accountNumber' },
            { header: 'Account Name', key: 'accountName' },
            { header: 'Deposit Amount', key: 'depositAmount' },
        ];

        users.forEach((user) => {
            worksheet.addRow(user);
        });

        // Save the workbook to a file
        await workbook.xlsx.writeFile('users.xlsx');
        console.log('User data written to users.xlsx');

        // Return the array of user objects (optional)
        return users;
}

generatePhoneNumber() {
    // Generate a random phone number using Math.random()
    let phoneNumber = "";
    for (let i = 0; i < 12; i++) {
        // Pick a random digit from 0 to 9
        let digit = Math.floor(Math.random() * 10);
        // Append the digit to the phone number
        phoneNumber += digit;
    }
    
    // Return the phone number
    return phoneNumber;
}

generateRandom(minVal, maxVal) {
    const randomNumber = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    return randomNumber.toString() + '000';
}

}


