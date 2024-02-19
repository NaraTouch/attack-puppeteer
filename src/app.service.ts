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
    // let users = await this.generateRandomUser(req.accounts);
    let users = await this.resumeUser();
    let res = new Res();
    for (let user of users) {
      if (user.status == 'done') {
        continue;
      }
      console.log(user);
      try {
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

        await page.type('#user_name', user.username, { delay: 10 });
        console.log('Input user_name -------------');

        await page.type('#user_pass', user.password, { delay: 10 });
        console.log('Input user_pass -------------');

        await page.type('#user_pass_confirm', user.password, { delay: 10 });
        console.log('Input user_pass_confirm -------------');

        await page.type('#user_email', user.email, { delay: 10 });
        console.log('Input user_email -------------');

        await page.type('#user_phone', user.phone, { delay: 10 });
        console.log('Input user_phone -------------');

        await page.type('#bank_username', user.accountName, { delay: 10 });
        console.log('Input bank_username -------------');

        await page.type('#bank_number', user.accountNumber, { delay: 10 });
        console.log('Input bank_number -------------');

        await page.type('#referral_code', user.referralCode, { delay: 10 });
        console.log('Input referral_code -------------');

        // Click the submit button by its class name
        await page.click('.btn-submit');
        await page.waitForNavigation({waitUntil: 'networkidle0'});

        const url = await page.url();

        // await page.goto(url+'deposit');
        console.log('deposit -------------');
        await Promise.all([
          page.goto(url+'deposit', {waitUntil: 'networkidle2'}),
          page.waitForNavigation()
        ]);
        // set up a dialog event handler
          page.on('dialog', async dialog => {
            console.log(dialog.message());
            if(dialog.message().includes('Proses Deposit Please Wait')) {
            //     console.log(`clicking "Yes" to ${dialog.message()}`);
                await dialog.accept(); // press 'ok'
            } else {
                await dialog.dismiss(); // press 'No'
            }
        });
        console.log('deposit page -------------');
        // const html = await page.content();
        await page.type('#nominal', user.depositAmount, { delay: 20 });
        console.log('Input nominal -------------');
        await page.click('input[name="submit_deposit"]');
        await browser.close();
        // await Promise.all([
        //   page.goto(url+'logout', {waitUntil: 'networkidle2'}),
        //   page.waitForNavigation()
        // ]);
        
        // // console.log('Browser url : '+url);
        // // await page.goto(url+'/logout');

        // await browser.close();
        // console.log('Close browser -------------');
      } catch (e) {
        console.log(e);
      }
    }
    return res.getRes();
  }
  async  resumeUser() {
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();

    // Read the file
    await workbook.xlsx.readFile('users-ex.xlsx');

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(1);

    // Create an empty array to store the user objects
    const users = [];

    // Loop through each row of the worksheet, starting from the second row
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        // Get the cell values from the row
        const username = row.getCell(1).value;
        const password = row.getCell(2).value;
        const email = row.getCell(3).value;
        const phone = row.getCell(4).value;
        const accountNumber = row.getCell(5).value;
        const accountName = row.getCell(6).value;
        const depositAmount = row.getCell(7).value;
        const referralCode = row.getCell(8).value;
        const status = row.getCell(9).value;

        // Create a user object with the fields
        const userObject = {
          username,
          password,
          email,
          phone,
          accountNumber,
          accountName,
          depositAmount,
          referralCode,
          status
        };

        // Push the user object to the array
        users.push(userObject);
      }
    });

    // Return the array of user objects
    return users;
   
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
            let referralCode = 'AGABK29305';
            let status = '';
            // Create a user object with the fields
            let userObject = {
                username,
                password,
                email,
                phone,
                accountNumber,
                accountName,
                depositAmount,
                referralCode,
                status
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
            { header: 'Referral Code', key: 'referralCode' },
            { header: 'status', key: 'status' },
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

