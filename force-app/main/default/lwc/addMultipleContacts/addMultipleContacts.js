import { LightningElement,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';

export default class AddMultipleContacts extends LightningElement {
    @api recordId;
    @track rows = [{RowId:1,FirstName:'',LastName:'',Email:'',Phone:''}];
    CountId = 1;
    @track parsedData = [];
    loading = false;

    get rowsCount(){
        return this.rows.length;
    }

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
        console.log({RowId:this.CountId,FirstName:'',LastName:'',Email:'',Phone:''});
        this.rows.push({RowId:this.CountId,FirstName:'',LastName:'',Email:'',Phone:''});
    }

    async handleSave(){
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
        const result = await LightningConfirm.open({
            message: `Please click 'Ok' to proceed with creation of ${this.rowsCount} contacts.`,
            variant: 'info',
            label: 'Confirm',
        });
        if(result){
            this.showToast('Success','Contacts created successfully','success');
            this.resetRows();
        }
    }

    removeRow(event){
        if(this.rows.length===1){
            this.showToast('You cannot remove','Atleast one row should be there','error');
            return;
        }
        const rowId = event.target.dataset.rowid;
        console.log(rowId);
        this.rows = this.rows.filter(i=>i.RowId!=rowId);
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

    cloneRow(event){
        const clickedRow = event.target.closest('tr');
        const inputs = clickedRow.querySelectorAll('lightning-input');
        const contact = {};
        inputs.forEach(inp=>{
            contact[inp.name] = inp.value;
        })
        this.CountId += 1;
        this.rows.push({RowId:this.CountId,FirstName:contact.FirstName || '',LastName:contact.LastName || '',Email:contact.Email || '',Phone:contact.Phone || ''});
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;
            this.parsedData = this.parseCSV(text);
            console.log('Parsed Object Array:', this.parsedData);
            if(this.parsedData){
                this.loading = false;
                if(JSON.stringify(Object.keys(this.parsedData[0])) !== JSON.stringify(['FirstName','LastName','Email','Phone'])){
                    this.showToast('Invalid csv template. Please use below column order.','FirstName | LastName | Email | Phone','error');
                    return;
                }
                this.parsedData = this.parsedData.map(i=>({...i,RowId:++this.CountId}))
                this.rows = [...this.rows,...this.parsedData];

            }
        };
        this.loading = true;
        reader.readAsText(file);
    }

    parseCSV(csv) {
        const lines = csv.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim()); //['mark','test@test.com']
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            return obj;
        });
    }

    resetRows(){
        this.CountId = 1;
        this.rows = [{RowId:1,FirstName:'',LastName:'',Email:'',Phone:''}];
    }
}