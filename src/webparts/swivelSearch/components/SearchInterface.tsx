import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField, ITextFieldProps, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import * as React from 'react';
import DateRange from '../../../components/DateRange';
import NumberRange from '../../../components/NumberRange';
import PeoplePicker from '../../../components/PeoplePicker';
import * as Model from '../../../model/AdvancedSearchModel';
import styles from './SwivelSearch.module.scss';
import DropdownResettable, { IDropdownResettableOption } from '../../../components/DropdownResettable';
import { on } from '../../../helpers/events';

const AdvancedMinimized: string = `${styles.pnlAdvanced} ${styles.pnlAdvancedMinimized}`;
const AdvancedExpanded: string = styles.pnlAdvanced;

export interface ISearchInterfaceProps {
    config: Array<Model.ISearchProperty>;
    searchHandler: (keywordSearch: string, searchModel: Array<Model.ISearchProperty>, additionalCriteria: string) => void;
    includeKeywordSearch: boolean;
    parentElement: HTMLElement;
    startMinimized: boolean;
    additionalCriteria: string;
}

export interface ISearchInterfaceState {
    keywordSearch: string;
    config: Array<Model.ISearchProperty>;
    resettableKey: string | number;
    classNameAdvanced: string;
    showAdvanced: boolean;
}

export default class SearchInterface extends React.Component<ISearchInterfaceProps, ISearchInterfaceState> {

    constructor(props: ISearchInterfaceProps) {
        super(props);

        this._conformPropertyChoices(props.config);
        this.state = {
            keywordSearch: '',
            config: props.config,
            resettableKey: 'test-1',
            classNameAdvanced: props.startMinimized && props.includeKeywordSearch ? AdvancedMinimized : AdvancedExpanded,
            showAdvanced: !(props.startMinimized && props.includeKeywordSearch)
        } as ISearchInterfaceState;

    }

    public state: ISearchInterfaceState;
    private readonly columns: number = 2;
    private readonly fieldHeight: number = 61;
    private readonly buttonRowHeight: number = 62;
    private fieldRefs: any = {};

    public componentWillReceiveProps(nextProps: ISearchInterfaceProps): void {
        const config =  [ ...nextProps.config ];

        this._conformPropertyChoices(config);
        
        this.setState({
          ...this.state,
          config,
          classNameAdvanced: nextProps.startMinimized && nextProps.includeKeywordSearch ? AdvancedMinimized : AdvancedExpanded,
          showAdvanced: !(nextProps.startMinimized && nextProps.includeKeywordSearch)
        } as ISearchInterfaceState);
    }
    
    public render(): React.ReactElement<ISearchInterfaceProps> {

        let controls: JSX.Element[] = [];
        let rows: JSX.Element[] = [];
        let key: number = 1;

        const { config } = this.state;

        config.forEach((field: Model.ISearchProperty, i: number) => {

            switch(field.type) {
                case Model.PropertyValueType.Int32:
                case Model.PropertyValueType.Int64:
                case Model.PropertyValueType.Guid:
                case Model.PropertyValueType.Double:
                case Model.PropertyValueType.Numeric:
                case Model.PropertyValueType.String:
                    if(field.operator === Model.SearchOperator.NumberRange) {

                        controls.push(
                            <NumberRange 
                                label={field.name}
                                onChanged={e => this.ctrl_changed(e, field)}
                                data-index={i}
                                key={key++}
                            />
                        );

                    } else {
                        
                        if(this._hasChoices(field)) {
                            
                            controls.push(
                                <DropdownResettable
                                    placeHolder={field.operator}
                                    label={field.name}
                                    options={field.propertyChoices as IDropdownResettableOption[]}
                                    selectedKey={field.choicesSelectedKey as any}
                                    onChanged={e => this.ctrl_changed(e, field)}
                                    data-index={i}
                                    key={key++} 
                                />
                            );

                        }
                        else {

                            controls.push(
                                <TextField
                                    spellCheck={false}
                                    placeholder={field.operator}
                                    label={field.name} 
                                    onChange={(ev, e) => this.ctrl_changed(e, field)}
                                    data-index={i}
                                    type={field.type === Model.PropertyValueType.Numeric ? "numeric" : ""}
                                    componentRef={(component: ITextField): void => {
                                        this.fieldRefs[field.property] = component;
                                    }}
                                    autoComplete={"off"}
                                    //value={field.value ? field.value.toString() : ''}
                                    key={key++} 
                                />
                            );

                        }
                    }
                    break;
                case Model.PropertyValueType.Person:
                    controls.push(
                        <PeoplePicker
                            onChanged={e => this.ctrl_changed(e, field)}
                            label={field.name}
                            componentRef={(component: PeoplePicker): void => {
                                this.fieldRefs[field.property] = component;
                            }}
                            placeholder={field.operator}
                            data-index={i}
                            key={key++}
                            //selectedItems={field.value as Array<IPersonaProps>}
                        />
                    );
                    break;
                case Model.PropertyValueType.Boolean:

                    controls.push(
                        <DropdownResettable 
                            placeHolder={field.operator}
                            label={field.name} 
                            //onChange={e => this.ctrl_change(e, field)}
                            onChanged={e => this.ctrl_changed(e, field)}
                            options={field.propertyChoices as IDropdownResettableOption[]}
                            selectedKey={field.choicesSelectedKey as any}
                            data-index={i} 
                            key={key++} 
                        />
                    );    
                    break;
                case Model.PropertyValueType.DateTime:
                    //field.options = field.options || {} as Model.ISearchPropertyOptions;
                    field.data = field.data || {} as any;
                    field.data.value = field.data.value || DateRange.emptyValue; 

                    controls.push(
                        <DateRange
                            placeHolder={field.name} 
                            label={field.name}
                            onChanged={e => this.ctrl_changed(e, field)}
                            //value={field.data.value as any}
                            data-index={i}
                            key={key++}
                        />
                    );

                    break;
                default:
                    console.error('unknown property type: ' + field.type);
                    break;
            }

    /*         if((i + 1) % this.columns === 0) {
                let r = this._row(controls, key);
                key = r.key as number;
                key++;
                rows.push(r);
                controls = [];
            } */

        });
/* 
        if(controls.length > 0) {
            let r = this._row(controls, key);
            key = r.key as number;
            key++;
            rows.push(r);
        } */

        rows = controls.map((c, i) => this._cell(c, i));
        
        return (
            <div className={styles.searchInterface}>
                {this.keywordSearch()}
                <div 
                    className={this.state.classNameAdvanced}
                    style={{
                        maxHeight: this.state.config.length * this.fieldHeight + this.buttonRowHeight
                    }}
                >
                    <div className={styles.grid} key="0">
                        {rows}
                    </div>
                    <div className={styles.buttonRow}>
                        
                        <PrimaryButton
                            primary={true}
                            data-automation-id="test"
                            text="Search"
                            onClick={this.btnSearch_click}
                        />
                        <PrimaryButton
                            primary={true}
                            data-automation-id="test"
                            text="Reset"
                            onClick={this.btnReset_click}
                        />
                    </div>
                </div>
            </div>
        );

    }

    public componentDidMount(): void {
        let si = this.props.parentElement.querySelector('.' + styles.searchInterface) as HTMLElement;

        on(si, 'keypress', 'input[type="text"],input[type]', this.onInput_keypress);

    }

    protected onInput_keypress = (e: KeyboardEvent) => {
        let key = e.keyCode;

        switch(key) {
            case 13:    // Enter
                this.btnSearch_click();
                break;
        }

    }

    protected keywordSearch(): React.ReactElement<HTMLDivElement> {
        if(this.props.includeKeywordSearch) {
            return (
                <div className={styles.keywordSearch}>
                    <TextField
                        placeholder="Search"
                        value={this.state.keywordSearch}
                        onChange={this.keywordSearch_changed}
                        autoFocus={true}
                        autoComplete={"off"}
                        onRenderPrefix={(props: ITextFieldProps): JSX.Element => {
                            return (
                                <DefaultButton
                                    iconProps={{
                                        iconName: 'Search'
                                    }}
                                    onClick={this.btnSearch_click}
                                    className="btnKeywordSearch"
                                />
                            );
                        }}
                        suffix={this.props.startMinimized ? "Advanced" : ""}
                        onRenderSuffix={(props: ITextFieldProps): JSX.Element => {
                            const { suffix } = props;
                            if(this.props.startMinimized) {
                                return (
                                    <DefaultButton 
                                        text={suffix}
                                        onClick={this.btnAdvanced_click}
                                        className="btnAdvanced"
                                        checked={this.state.showAdvanced}
                                    />
                                );
                            } else {
                                return null;
                            }
                        }}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    protected keywordSearch_changed = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, keywordSearch: string): void => {
        console.log('keywordSearch: ', keywordSearch);
         this.setState({
            ...this.state,
            keywordSearch
         } as ISearchInterfaceState);
    }

    protected resettableChanged(selected: IDropdownOption): void {

        this.setState({
            ...this.state,
            resettableKey: selected.key
        });
    }

    public formChange(): void {

    }

    protected btnAdvanced_click = (e: React.MouseEvent<any>): void => {
        let { showAdvanced } = this.state;

        showAdvanced = !showAdvanced;
        
        this.setState({
            ...this.state,
            showAdvanced,
            classNameAdvanced: showAdvanced ? AdvancedExpanded : AdvancedMinimized
        });

    }

    protected btnSearch_click = (e?: React.MouseEvent<any>): void => {
        this.props.searchHandler(this.state.keywordSearch, this.state.config, this.props.additionalCriteria);
    }

    protected btnReset_click = (e: React.MouseEvent<any>): void => {

        let keywordSearch = "";

        let config = [ ...this.state.config ] as Array<Model.ISearchProperty>;

        config.forEach((field: Model.ISearchProperty) => {

            if(field.type === Model.PropertyValueType.DateTime) {
                field.data.value = null;
            } else if(field.type === Model.PropertyValueType.Numeric ||
                      field.type === Model.PropertyValueType.String) {
                if(field.operator === Model.SearchOperator.NumberRange) {
                    field.value = null;
                } else {
                    if(this._hasChoices(field)) {
                        field.choicesSelectedKey = '';
                        field.value = null;
                    } else {
                        field.value = null;
                        //let ref: TextField = this.fieldRefs[field.property];
                        let ref: any = this.fieldRefs[field.property];
                        this._resetTextfield(ref);
                    }
                }
            } else if(field.type === Model.PropertyValueType.Person) {
                field.value = null;
                let ref: PeoplePicker = this.fieldRefs[field.property];
                ref.reset();
            } else if(this._hasChoices(field) || field.type === Model.PropertyValueType.Boolean) {

                field.choicesSelectedKey = '';
                field.value = null;

            } else {
                field.value = '';
            }
        });

        this.setState({
            ...this.state,
            config,
            keywordSearch
        } as ISearchInterfaceState);
    }

    protected ctrl_change(val: React.FormEvent<HTMLDivElement>, field: Model.ISearchProperty): void {

        console.log('change', val);


    }

    protected ctrl_changed(val: any, field: Model.ISearchProperty): void {
        
        //let config = [ ...this.state.config ] as Array<Model.ISearchProperty>;
        //let newProp = config[field.propIndex];
        //newProp.value = (!!val && val.value !== undefined) ? val.value : val;
        //newProp.value = val;

        field.value = val;
/* 
        this.setState({
            ...this.state,
            config
        }); */

/* 
        if(field.type === Model.PropertyValueType.DateTime) {
            let drVal = val as IDateRangeValue;
            newProp.data.value = drVal;
            newProp.operator = drVal.operator as any;

            if(drVal.date) {
                newProp.value = drVal.date.toISOString();
            }

            if(drVal.operator === DateRangeOperator.Between && drVal.dateEnd) {
                newProp.value += ';' + drVal.dateEnd;
            }

            //newProp.operator = drVal.operator.internal as any;
            newProp.value = drVal;

        } */
/* 
        if(field.type === Model.PropertyValueType.Person) {
            let perVal = val as Array<IPersonaProps>;
            newProp.value = perVal;
        }

        if(field.type === Model.PropertyValueType.Numeric) {
            let numVal = val as INumberRangeValue;
            //newProp.operator = numVal.operator.internal as any;
            newProp.value = numVal;
        } */

    }

    private _container(rows: JSX.Element[], key: number): JSX.Element {
        return (
            <div className="ms-Grid" key={key++}>{rows}</div>
        );
    }

    private _resetTextfield(field: ITextField): void {

        field['setState']({
            ...field['state'],
            value: ''
        });

    }

    private _cell(control: JSX.Element, key: number): JSX.Element {
        return (<div className={styles.cell} key={key++}>{control}</div>);
    }

    private _row(controls: JSX.Element[], key: number): JSX.Element {

        let cells: JSX.Element[] = [];

        controls.forEach((control: JSX.Element, i: number) => {
            cells.push(
                <div className={styles.cell} key={key++}>{control}</div>
            );
        });
        return (
            <div className={styles.row} key={key++}>
                {cells}
            </div>
        );
    }

    private _hasChoices(field: Model.ISearchProperty): boolean {
        return field.choices && field.choices.length > 0;
    }
    
    private _isSearchPropertyChoice(choice: any): choice is Model.ISearchPropertyChoice {
        return choice && typeof choice !== 'string' && typeof choice !== 'number';
    }

    private _conformPropertyChoices(config: Array<Model.ISearchProperty>): void {
        const delim = "|";

        config.forEach(field => {
            if(field.type == Model.PropertyValueType.Boolean) {
                field.data = field.data || DateRange.emptyValue;

                field.propertyChoices = [
                    { key: `${field.property}-1`, text: 'Yes', value: 'true' }, 
                    { key: `${field.property}-2`, text: 'No', value: 'false' }
                ];

            }
            if(this._hasChoices(field)) {

                field.propertyChoices = [];

                field.choices.split("\n").forEach((text, idx) => {
                    let value = text;
                    let key = `${field.property}-${idx}`;

                    if(text.indexOf(delim) !== -1) {
                        let arr = text.split(delim);
                        text = arr[0];
                        value = arr[1];
                    }
                    
                    field.propertyChoices.push({
                        key,
                        text,
                        value
                    } as Model.ISearchPropertyChoice);
                });
            }
        });
    }
}
