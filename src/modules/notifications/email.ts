import nodemailer, { type Transporter } from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The build script copies the templates into dist/, so this resolves from both src/ and dist/
const viewPath = path.resolve(__dirname, '..', 'views');

export interface SendEmailOptions {
  to: string;
  subject: string;
  // Template file name in modules/views, with or without the .handlebars extension
  template: string;
  context?: Record<string, unknown>;
  text?: string;
}

let transporter: Transporter | undefined;

// Created once and reused instead of opening a new SMTP transport per email
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });

    transporter.use('compile', hbs({
      viewEngine: {
        extname: '.handlebars',
        partialsDir: viewPath,
        layoutsDir: viewPath,
        defaultLayout: false,
        helpers: {},
        compilerOptions: {}
      },
      viewPath: viewPath,
      extName: '.handlebars',
    }));
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, text, template, context }: SendEmailOptions) => {
  try {
    const mailOptions = {
      from: {
        name: config.app.name,
        address: config.email.user
      },
      to,
      subject,
      text,
      template: template.replace('.handlebars', ''),
      context
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error instanceof Error ? error.message : error);
    return false;
  }
};
