const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Template = require('../models/Template');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/docgen');
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Template.deleteMany({});
    console.log('Cleared existing data');

    // Create default users
    const salt = await bcrypt.genSalt(12);

    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@docgen.com',
      password: await bcrypt.hash('admin123', salt),
      role: 'admin',
      isActive: true
    });

    const hrUser = new User({
      name: 'HR Manager',
      email: 'hr@docgen.com',
      password: await bcrypt.hash('hr123', salt),
      role: 'hr',
      isActive: true
    });

    const staffUser = new User({
      name: 'Staff Member',
      email: 'staff@docgen.com',
      password: await bcrypt.hash('staff123', salt),
      role: 'staff',
      isActive: true
    });

    await User.insertMany([adminUser, hrUser, staffUser]);
    console.log('Created default users');

    // Create sample templates
    const offerLetterTemplate = new Template({
      name: 'Job Offer Letter',
      description: 'Standard job offer letter template',
      type: 'offer_letter',
      content: `Dear {{name}},

We are pleased to offer you the position of {{position}} at {{company}}. We believe your skills and experience will be a valuable addition to our team.

Position Details:
- Position: {{position}}
- Department: {{department}}
- Start Date: {{start_date}}
- Salary: {{salary}}
- Reporting Manager: {{manager}}

Your employment will be subject to the following terms and conditions:

1. This offer is contingent upon successful completion of background verification and reference checks.
2. You will be required to sign our standard employment agreement.
3. Your working hours will be {{working_hours}} per week.
4. You will be entitled to {{vacation_days}} vacation days per year.

Please confirm your acceptance of this offer by {{response_deadline}}. We look forward to welcoming you to our team.

Best regards,

{{hr_name}}
Human Resources Department
{{company}}
{{company_address}}
Phone: {{company_phone}}
Email: {{company_email}}

Generated on: {{generation_date}}`,
      placeholders: [
        { name: 'name', description: 'Candidate full name', type: 'text', required: true },
        { name: 'position', description: 'Job position', type: 'text', required: true },
        { name: 'company', description: 'Company name', type: 'text', required: true },
        { name: 'department', description: 'Department name', type: 'text', required: true },
        { name: 'start_date', description: 'Employment start date', type: 'date', required: true },
        { name: 'salary', description: 'Annual salary', type: 'text', required: true },
        { name: 'manager', description: 'Reporting manager name', type: 'text', required: true },
        { name: 'working_hours', description: 'Working hours per week', type: 'number', required: true },
        { name: 'vacation_days', description: 'Annual vacation days', type: 'number', required: true },
        { name: 'response_deadline', description: 'Response deadline date', type: 'date', required: true },
        { name: 'hr_name', description: 'HR representative name', type: 'text', required: true },
        { name: 'company_address', description: 'Company address', type: 'text', required: true },
        { name: 'company_phone', description: 'Company phone number', type: 'text', required: true },
        { name: 'company_email', description: 'Company email', type: 'email', required: true },
        { name: 'generation_date', description: 'Document generation date', type: 'date', required: false }
      ],
      accessRoles: ['admin', 'hr', 'staff'],
      isActive: true,
      createdBy: adminUser._id
    });

    const appointmentLetterTemplate = new Template({
      name: 'Appointment Letter',
      description: 'Official appointment letter template',
      type: 'appointment_letter',
      content: `APPOINTMENT LETTER

{{company}}
{{company_address}}

Date: {{appointment_date}}

Dear {{name}},

We are pleased to inform you that you have been appointed to the position of {{position}} in the {{department}} department of {{company}}, effective from {{joining_date}}.

Terms of Appointment:

1. Position: {{position}}
2. Department: {{department}}
3. Employee ID: {{employee_id}}
4. Joining Date: {{joining_date}}
5. Probation Period: {{probation_period}} months
6. Basic Salary: {{basic_salary}} per month
7. Reporting Manager: {{reporting_manager}}
8. Work Location: {{work_location}}

Responsibilities:
{{job_responsibilities}}

Working Hours:
Your normal working hours will be {{working_hours}} per day, {{working_days}} days per week.

Benefits:
- Health Insurance
- Provident Fund
- {{additional_benefits}}

This appointment is subject to:
1. Satisfactory completion of probation period
2. Adherence to company policies and procedures
3. Maintenance of confidentiality

Please report to {{reporting_person}} on {{joining_date}} at {{reporting_time}} for your joining formalities.

We welcome you to our organization and look forward to a long and mutually beneficial association.

Yours sincerely,

{{hr_signature}}
{{hr_name}}
{{hr_designation}}
Human Resources Department

Acknowledgment:
I accept the above terms and conditions of my appointment.

Employee Signature: _________________ Date: _________
{{name}}`,
      placeholders: [
        { name: 'name', description: 'Employee full name', type: 'text', required: true },
        { name: 'position', description: 'Job position', type: 'text', required: true },
        { name: 'company', description: 'Company name', type: 'text', required: true },
        { name: 'company_address', description: 'Company address', type: 'text', required: true },
        { name: 'department', description: 'Department name', type: 'text', required: true },
        { name: 'employee_id', description: 'Employee ID', type: 'text', required: true },
        { name: 'appointment_date', description: 'Appointment letter date', type: 'date', required: true },
        { name: 'joining_date', description: 'Joining date', type: 'date', required: true },
        { name: 'probation_period', description: 'Probation period in months', type: 'number', required: true },
        { name: 'basic_salary', description: 'Basic salary amount', type: 'text', required: true },
        { name: 'reporting_manager', description: 'Reporting manager name', type: 'text', required: true },
        { name: 'work_location', description: 'Work location', type: 'text', required: true },
        { name: 'job_responsibilities', description: 'Job responsibilities', type: 'text', required: true },
        { name: 'working_hours', description: 'Working hours per day', type: 'number', required: true },
        { name: 'working_days', description: 'Working days per week', type: 'number', required: true },
        { name: 'additional_benefits', description: 'Additional benefits', type: 'text', required: false },
        { name: 'reporting_person', description: 'Person to report to on joining', type: 'text', required: true },
        { name: 'reporting_time', description: 'Reporting time on joining day', type: 'text', required: true },
        { name: 'hr_name', description: 'HR representative name', type: 'text', required: true },
        { name: 'hr_designation', description: 'HR representative designation', type: 'text', required: true },
        { name: 'hr_signature', description: 'HR signature placeholder', type: 'text', required: false }
      ],
      accessRoles: ['admin', 'hr'],
      isActive: true,
      createdBy: adminUser._id
    });

    const experienceLetterTemplate = new Template({
      name: 'Experience Certificate',
      description: 'Employee experience certificate template',
      type: 'experience_letter',
      content: `EXPERIENCE CERTIFICATE

{{company}}
{{company_address}}
Phone: {{company_phone}} | Email: {{company_email}}

Date: {{issue_date}}

TO WHOM IT MAY CONCERN

This is to certify that {{name}} was employed with {{company}} from {{joining_date}} to {{leaving_date}}.

Employment Details:
- Employee Name: {{name}}
- Employee ID: {{employee_id}}
- Designation: {{designation}}
- Department: {{department}}
- Period of Employment: {{joining_date}} to {{leaving_date}}
- Duration: {{employment_duration}}

During the tenure of employment, {{name}} was found to be:
- Hardworking and dedicated
- Punctual and regular
- {{performance_remarks}}

{{name}} worked on the following key responsibilities:
{{job_responsibilities}}

Key Achievements:
{{achievements}}

We found {{name}} to be honest, sincere, and hardworking. {{he_she}} has good interpersonal skills and was well-liked by colleagues and management.

{{name}} is leaving the organization on {{leaving_date}} due to {{reason_for_leaving}}.

We wish {{name}} all the best for future endeavors.

This certificate is issued upon the request of the employee.

Yours sincerely,

{{hr_signature}}
{{hr_name}}
{{hr_designation}}
Human Resources Department
{{company}}

Note: This is a computer-generated certificate and does not require a physical signature.`,
      placeholders: [
        { name: 'name', description: 'Employee full name', type: 'text', required: true },
        { name: 'company', description: 'Company name', type: 'text', required: true },
        { name: 'company_address', description: 'Company address', type: 'text', required: true },
        { name: 'company_phone', description: 'Company phone', type: 'text', required: true },
        { name: 'company_email', description: 'Company email', type: 'email', required: true },
        { name: 'employee_id', description: 'Employee ID', type: 'text', required: true },
        { name: 'designation', description: 'Job designation', type: 'text', required: true },
        { name: 'department', description: 'Department name', type: 'text', required: true },
        { name: 'joining_date', description: 'Joining date', type: 'date', required: true },
        { name: 'leaving_date', description: 'Leaving date', type: 'date', required: true },
        { name: 'employment_duration', description: 'Employment duration', type: 'text', required: true },
        { name: 'issue_date', description: 'Certificate issue date', type: 'date', required: true },
        { name: 'performance_remarks', description: 'Performance remarks', type: 'text', required: true },
        { name: 'job_responsibilities', description: 'Job responsibilities', type: 'text', required: true },
        { name: 'achievements', description: 'Key achievements', type: 'text', required: false },
        { name: 'reason_for_leaving', description: 'Reason for leaving', type: 'text', required: true },
        { name: 'he_she', description: 'He/She pronoun', type: 'text', required: true },
        { name: 'hr_name', description: 'HR representative name', type: 'text', required: true },
        { name: 'hr_designation', description: 'HR representative designation', type: 'text', required: true },
        { name: 'hr_signature', description: 'HR signature placeholder', type: 'text', required: false }
      ],
      accessRoles: ['admin', 'hr'],
      isActive: true,
      createdBy: adminUser._id
    });

    const certificateTemplate = new Template({
      name: 'Training Certificate',
      description: 'Training completion certificate template',
      type: 'certificate',
      content: `CERTIFICATE OF COMPLETION

{{organization}}
{{organization_address}}

This is to certify that

{{participant_name}}

has successfully completed the training program on

"{{training_title}}"

conducted from {{start_date}} to {{end_date}}

Training Details:
- Duration: {{training_duration}} hours
- Training Mode: {{training_mode}}
- Trainer: {{trainer_name}}
- Training Location: {{training_location}}

Topics Covered:
{{topics_covered}}

Assessment Results:
- Score: {{score}}%
- Grade: {{grade}}
- Status: {{completion_status}}

This certificate is awarded in recognition of the dedication and effort shown during the training program.

Date of Issue: {{issue_date}}
Certificate ID: {{certificate_id}}

{{trainer_signature}}
{{trainer_name}}
{{trainer_designation}}

{{organization_seal}}
{{organization}}`,
      placeholders: [
        { name: 'participant_name', description: 'Participant full name', type: 'text', required: true },
        { name: 'organization', description: 'Organization name', type: 'text', required: true },
        { name: 'organization_address', description: 'Organization address', type: 'text', required: true },
        { name: 'training_title', description: 'Training program title', type: 'text', required: true },
        { name: 'start_date', description: 'Training start date', type: 'date', required: true },
        { name: 'end_date', description: 'Training end date', type: 'date', required: true },
        { name: 'training_duration', description: 'Training duration in hours', type: 'number', required: true },
        { name: 'training_mode', description: 'Training mode (Online/Offline/Hybrid)', type: 'text', required: true },
        { name: 'trainer_name', description: 'Trainer name', type: 'text', required: true },
        { name: 'training_location', description: 'Training location', type: 'text', required: true },
        { name: 'topics_covered', description: 'Topics covered in training', type: 'text', required: true },
        { name: 'score', description: 'Assessment score percentage', type: 'number', required: true },
        { name: 'grade', description: 'Grade achieved', type: 'text', required: true },
        { name: 'completion_status', description: 'Completion status', type: 'text', required: true },
        { name: 'issue_date', description: 'Certificate issue date', type: 'date', required: true },
        { name: 'certificate_id', description: 'Certificate ID', type: 'text', required: true },
        { name: 'trainer_designation', description: 'Trainer designation', type: 'text', required: true },
        { name: 'trainer_signature', description: 'Trainer signature placeholder', type: 'text', required: false },
        { name: 'organization_seal', description: 'Organization seal placeholder', type: 'text', required: false }
      ],
      accessRoles: ['admin', 'hr', 'staff'],
      isActive: true,
      createdBy: adminUser._id
    });

    await Template.insertMany([
      offerLetterTemplate,
      appointmentLetterTemplate,
      experienceLetterTemplate,
      certificateTemplate
    ]);

    console.log('Created sample templates');
    console.log('Seed data created successfully!');
    console.log('\nDefault Users:');
    console.log('Admin: admin@docgen.com / admin123');
    console.log('HR: hr@docgen.com / hr123');
    console.log('Staff: staff@docgen.com / staff123');

    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
