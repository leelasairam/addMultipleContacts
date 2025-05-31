import { LightningElement,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AddMultipleContacts extends LightningElement {
    @api recordId;
    @track rows = [1];
    CountId = 1;

    showToast(title,msg,varient) {
        const event = new ShowToastEvent({
            title: title,
            message: msg,
            variant: varient,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    addRow(){
        console.log('clicked...')
        this.CountId += 1;
        console.log(this.CountId);
        this.rows.push(this.CountId);
    }

    handleSave(){
        const contacts = [];
        const container = this.refs.contactForm;
        const rows = container.querySelectorAll('.contact-row');
        const isValid = this.validateContacts(rows);
        if(!isValid){
            console.log('error...');
            this.showToast('Please check the errors','','error');
            return;
        }
        rows.forEach(row=>{
            const inputs = row.querySelectorAll('lightning-input');
            const contact = {};
            inputs.forEach(inp=>{
                contact[inp.name] = inp.value;
            })
            contacts.push(contact);
        })
        console.log(contacts);
    }

    removeRow(event){
        if(this.rows.length===1){
            this.showToast('You cannot remove','Atleast one row should be there','error');
            return;
        }
        const rowId = event.target.dataset.rowid;
        console.log(rowId);
        this.rows = this.rows.filter(i=>i!=rowId);
    }

    validateContacts(rows){
        let isValid = true;
        rows.forEach(row=>{
            const inputs = row.querySelectorAll('lightning-input');
            inputs.forEach(inp=>{
                //Phone Input
                if(inp.name === 'Phone'){
                    if(inp.value.length<5){
                        inp.setCustomValidity("Enter valid phone number");
                        isValid = false;
                    }
                    else{
                        inp.setCustomValidity('');
                    }
                    inp.reportValidity();
                }
                //First Name and Last Name
                if(inp.name === 'FirstName' || inp.name === 'LastName' || inp.name === 'Email'){
                    if(!inp.value){
                        inp.setCustomValidity(`${inp.name} cannot be blank`);
                        isValid = false;
                    }
                    else{
                        inp.setCustomValidity('');
                    }
                    inp.reportValidity();
                }
            })
        })
        return isValid;
    }
}