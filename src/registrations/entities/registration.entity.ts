export class Registration {
    registration_id
event_id		// Reference to eventstable
user_id		// Reference to userstable
registration_date	
payment_status	ENUM('Pending', 'Completed', 'Failed')	
payment_amount
}
