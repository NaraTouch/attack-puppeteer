import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Req } from './models/req';
import { Res } from './models/res';
import { User } from './models/user'; // Define the User type (adjust the path)

@Injectable()
export class AppService {

  private url = 'https://beerslot365.com/';
  // private timeout = 10000000;
  private timeout = 100000;
  private error_msg = [
    'Silakan Pilih Username Lain',
    'Data telah terdaftar. Silakan gunakan Data Lain.',
  ];

  getHello(): string {
    return 'Hello World!';
  }

  async writeUser(user:any) {
    const ExcelJS = require("exceljs");
    // Load the existing excel file
    const file_name = 'phismeoff.xlsx';
    const workbook = await new ExcelJS.Workbook().xlsx.readFile(file_name);
    // Get the existing worksheet by its name
    const worksheet = workbook.getWorksheet("Users");
    // Get the last row of the worksheet and increment its number
    const lastRow = worksheet.lastRow;
    const nextRow = worksheet.getRow(lastRow.number + 1);
    // Add the user object values to the next row
    nextRow.getCell("A").value = user.username;
    nextRow.getCell("B").value = user.password;
    nextRow.getCell("C").value = user.email;
    nextRow.getCell("D").value = user.phone;
    nextRow.getCell("E").value = user.accountNumber;
    nextRow.getCell("F").value = user.accountName;
    nextRow.getCell("G").value = user.depositAmount;
    nextRow.getCell("H").value = user.referralCode;
    nextRow.getCell("I").value = user.status;
    nextRow.getCell("J").value = user.message;
    nextRow.commit();
    // Save the updated workbook to the same file
    return await workbook.xlsx.writeFile(file_name);
  }
  
  async attack(req: Req) {
    // let users = await this.generateRandomUser(req.accounts);
    let res = new Res();
    let users = await this.resumeUser();
    
    for (let user of users) {
      if (user.status == 'done') {
        console.log(user.status);
        continue;
      }
      user.status = 'no';
      user.message = 'failed';
      const options = {
        width: 1920,
        height: 1080
      };

      const randomUseragent = require('random-useragent');
      // const useragent = randomUseragent.getRandom(function (ua: any) {
      //   return ua.browserName === 'Chrome';
      // });
      const useragent = randomUseragent.getRandom(function (ua: any) {
          if (ua.browserName === 'Chrome' && parseFloat(ua.browserVersion) >= 20) {
            return ua.browserName;
          }
      });
      console.log(useragent);
  
      res.message = 'success';
      const browser = await puppeteer.launch({
        headless: false,
        args: [
          `--window-size=${options.width},${options.height}`,
        ],
      });
      let page = await browser.newPage();
      await page.setViewport(options);
      await page.setDefaultNavigationTimeout(this.timeout);
      await page.setDefaultTimeout(0);
      // await page.setUserAgent(useragent);
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
      });
      await page.setJavaScriptEnabled(true);
      
      try {
        await Promise.all([
            page.goto(this.url, {waitUntil: 'networkidle2'}),
            page.waitForNavigation()
          ]);
          let div_selector_to_remove= "#popup1";
          await page.evaluate((sel) => {
              var elements = document.querySelectorAll(sel);
              for(var i=0; i< elements.length; i++){
                  elements[i].parentNode.removeChild(elements[i]);
              }
          }, div_selector_to_remove)
          // Login
          await page.type('#username', user.username, { delay: 10 });
          console.log('Input user_name -------------');
          await page.type('#password', user.password, { delay: 10 });
          console.log('Input password -------------');
          //  // Click the submit button by its class name
          await page.click('input[name="signin"]');
          // End login
        /*  Sign up 
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
        */
        try {
          const message = await page.waitForFunction(() => {
            return document.querySelector("#rendered-message-amp-form-2");
          }, { timeout: 3000 }); // Wait for 3 seconds
          // Do something with the message element, such as getting its text content
          let text = '';
          try {
            text = await page.evaluate((el) => el.textContent, message);
          } catch(e) {
            console.log(e);
          }
          if (text) {
            const trimmedText = text.trim();
            let found = this.error_msg.includes(trimmedText);
            // console.log(text);
            console.log(trimmedText);
            console.log(found);
            if (found) {
              user.status = 'no';
              user.message = text;
              await this.writeUser(user);
              await browser.close();
              continue;
            }
          }
        } catch(e) {
          console.log(e);
        }
      
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
        user.status = 'done';
        user.message = 'success';
        await this.writeUser(user);
        await browser.close();
        continue;
      } catch (e) {
        console.log(e);
        user.status = 'no';
        user.message = 'failed';
        await this.writeUser(user);
        await browser.close();
        continue;
      }
    }
    return res.getRes();
  }

  async  resumeUser() {
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();

    // Read the file
    await workbook.xlsx.readFile('phismeoff-user.xlsx');

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
        const message = row.getCell(10).value;

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
          status,
          message
        };

        // Push the user object to the array
        users.push(userObject);
      }
    });

    // Return the array of user objects
    return users;
   
  }

  async generateRandomUser(user_count: any) {
    const faker = require('faker');
    const ExcelJS = require('exceljs');

    // Create an array to store the user objects
    const users: User[] = [];

    // Loop user_count times
    for (let i = 0; i < user_count; i++) {
        // Generate random user data
        let username = `phismeoff${i + 1}`; // Construct the username
        let password = faker.internet.password();
        let email = `phismeoff${i + 1}@example.com`; // Construct the email
        let phone = this.generatePhoneNumber();
        let accountNumber = faker.finance.account();
        let accountName = faker.name.findName();
        let depositAmount = this.generateRandom(1, 99);
        let referralCode = 'AGABK29305';
        let status = '';
        let message = '';

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
            status,
            message
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

  // async  generateRandomUser(user_count: any) {
  //   const faker = require('faker');
  //   const ExcelJS = require('exceljs');
  //       // Create an array to store the user objects
  //       const users: User[] = [];

  //       // Loop user_count times
  //       for (let i = 0; i < user_count; i++) {
  //           // Generate random user data
  //           let username = faker.name.findName();
  //           let password = faker.internet.password();
  //           let email = faker.internet.email().toLowerCase();
  //           let phone = this.generatePhoneNumber();
  //           let accountNumber = faker.finance.account();
  //           let accountName = faker.name.findName();
  //           let depositAmount = this.generateRandom(1, 99);
  //           let referralCode = 'AGABK29305';
  //           let status = '';
  //           let message = '';
  //           // Create a user object with the fields
  //           let userObject = {
  //               username,
  //               password,
  //               email,
  //               phone,
  //               accountNumber,
  //               accountName,
  //               depositAmount,
  //               referralCode,
  //               status,
  //               message
  //           };

  //           // Push the user object to the array
  //           users.push(userObject);
  //       }

  //       // Write user data to an Excel file
  //       const workbook = new ExcelJS.Workbook();
  //       const worksheet = workbook.addWorksheet('Users');
  //       worksheet.columns = [
  //           { header: 'Username', key: 'username' },
  //           { header: 'Password', key: 'password' },
  //           { header: 'Email', key: 'email' },
  //           { header: 'Phone', key: 'phone' },
  //           { header: 'Account Number', key: 'accountNumber' },
  //           { header: 'Account Name', key: 'accountName' },
  //           { header: 'Deposit Amount', key: 'depositAmount' },
  //           { header: 'Referral Code', key: 'referralCode' },
  //           { header: 'status', key: 'status' },
  //       ];

  //       users.forEach((user) => {
  //           worksheet.addRow(user);
  //       });

  //       // Save the workbook to a file
  //       await workbook.xlsx.writeFile('users.xlsx');
  //       console.log('User data written to users.xlsx');

  //       // Return the array of user objects (optional)
  //       return users;
  // }

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

