import { PrimaryButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { TextField, ITextFieldProps, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import * as React from 'react';
import DateRange, { EmptyValue, IDateRangeValue } from '../../../components/DateRange';
import NumberRange from '../../../components/NumberRange';
import PeoplePicker from '../../../components/PeoplePicker';
import { 
    ISearchProperty,
    ISearchPropertyChoice,
    PropertyValueType, 
    SearchOperator,
} from '../../../model/AdvancedSearchModel';
import styles from './SwivelSearch.module.scss';
import DropdownResettable, { IDropdownResettableOption } from '../../../components/DropdownResettable';
import { on } from '../../../helpers/events';
import { IPersonaProps } from 'office-ui-fabric-react';

const AdvancedMinimized: string = `${styles.pnlAdvanced} ${styles.pnlAdvancedMinimized}`;
const AdvancedExpanded: string = styles.pnlAdvanced;

export interface ISearchInterfaceProps {
    config: ISearchProperty[];
    searchHandler: (keywordSearch: string, searchModel: ISearchProperty[], additionalCriteria: string) => void;
    includeKeywordSearch: boolean;
    parentElement: HTMLElement;
    startMinimized: boolean;
    additionalCriteria: string;
}

export interface ISearchInterfaceState {
    keywordSearch: string;
    config: ISearchProperty[];
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

    componentDidUpdate(prevProps, prevState) {
        // update logic here
    }

/* 
    public componentWillReceiveProps(nextProps: ISearchInterfaceProps): void {
        const config =  [ ...nextProps.config ];

        this._conformPropertyChoices(config);
        
        this.setState({
          ...this.state,
          config,
          classNameAdvanced: nextProps.startMinimized && nextProps.includeKeywordSearch ? AdvancedMinimized : AdvancedExpanded,
          showAdvanced: !(nextProps.startMinimized && nextProps.includeKeywordSearch)
        } as ISearchInterfaceState);
    } */
    
    public render(): React.ReactElement<ISearchInterfaceProps> {

        const controls: JSX.Element[] = [];

        const { config, showAdvanced } = this.state;

        config.forEach((field: ISearchProperty, i: number) => {

            switch(field.type) {
                case PropertyValueType.Int32:
                case PropertyValueType.Int64:
                case PropertyValueType.Guid:
                case PropertyValueType.Double:
                case PropertyValueType.Numeric:
                case PropertyValueType.String:
                    if(field.operator === SearchOperator.NumberRange) {

                        controls.push(
                            <NumberRange 
                                label={field.name}
                                onChanged={e => this.ctrl_changed(e, field)}
                                data-index={i}
                                value={field.value as any}
                                key={field.property}
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
                                    key={field.property} 
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
                                    type={field.type === PropertyValueType.Numeric ? "numeric" : ""}
                                    value={field.value as string}
                                    /* componentRef={(component: ITextField): void => {
                                        this.fieldRefs[field.property] = component;
                                    }} */
                                    autoComplete={"new-password"}
                                    //value={field.value ? field.value.toString() : ''}
                                    key={field.property} 
                                />
                            );

                        }
                    }
                    break;
                case PropertyValueType.Person:
                    controls.push(
                        <PeoplePicker
                            onChanged={e => this.ctrl_changed(e, field)}
                            label={field.name}
              /*               componentRef={(component: PeoplePicker): void => {
                                this.fieldRefs[field.property] = component;
                            }} */
                            placeholder={field.operator}
                            data-index={i}
                            key={field.property}
                            selectedItems={field.value as IPersonaProps[]}
                        />
                    );
                    break;
                case PropertyValueType.Boolean:

                    controls.push(
                        <DropdownResettable 
                            placeHolder={field.operator}
                            label={field.name} 
                            //onChange={e => this.ctrl_change(e, field)}
                            onChanged={e => this.ctrl_changed(e, field)}
                            options={field.propertyChoices as IDropdownResettableOption[]}
                            selectedKey={field.choicesSelectedKey as any}
                            data-index={i} 
                            key={field.property} 
                        />
                    );    
                    break;
                case PropertyValueType.DateTime:
                    //field.options = field.options || {} as Model.ISearchPropertyOptions;
                    //field.data = field.data || {} as any;
                    //field.value = field.value || EmptyValue(); 

                    controls.push(
                        <DateRange
                            placeHolder={field.name} 
                            label={field.name}
                            onChanged={e => this.ctrl_changed(e, field)}
                            value={field.value as IDateRangeValue}
                            data-index={i}
                            key={field.property}
                        />
                    );

                    break;
                default:
                    console.error('unknown property type: ' + field.type);
                    break;
            }


        });

        const rows = controls.map((c, i) => this._cell(c, `cell${i}`));
        
        return (
            <div className={styles.searchInterface}>
                {this.keywordSearch()}
                <div 
                    className={showAdvanced ? AdvancedExpanded : AdvancedMinimized}
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
        //let si = this.props.parentElement.querySelector('.' + styles.searchInterface) as HTMLElement;

        //on(si, 'keypress', 'input[type="text"],input[type]', this.onInput_keypress);

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
        const { showAdvanced } = this.state;
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
                                <ActionButton
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
                                    <ActionButton 
                                        text={suffix}
                                        onClick={e => this.setState({ showAdvanced: !showAdvanced })}
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

    protected btnSearch_click = (e?: React.MouseEvent<any>): void => {
        this.props.searchHandler(this.state.keywordSearch, this.state.config, this.props.additionalCriteria);
    }

    protected btnReset_click = (e: React.MouseEvent<any>): void => {

        let keywordSearch = "";

        let config = [ ...this.state.config ] as ISearchProperty[];

        config.forEach((field: ISearchProperty) => {

            switch(true) {
                case field.type === PropertyValueType.Boolean:
                case this._hasChoices(field):
                    field.choicesSelectedKey = '';
                    //field.value = null;
                    break;
                case field.type === PropertyValueType.Person:
                    field.value = [];
                    break;
                default:
                    field.value = null;
            }

        });

        this.setState({
            config,
            keywordSearch
        } as ISearchInterfaceState);
    }

    protected ctrl_changed(val: any, field: ISearchProperty): void {

        console.log('ctrl_changed', arguments);

        const { config } = this.state;
        const newProp = config[field.propIndex];

        switch(field.type) {
            case PropertyValueType.Boolean:
                newProp.choicesSelectedKey = val.key;
                break;
            default:
                newProp.value = val;
        }

        this.setState({
            config,
        });
        
        //let config = [ ...this.state.config ] as Array<Model.ISearchProperty>;
        //let newProp = config[field.propIndex];
        //newProp.value = (!!val && val.value !== undefined) ? val.value : val;
        //newProp.value = val;

        //field.value = val;

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


    private _cell(control: JSX.Element, key: string): JSX.Element {
        return (<div className={styles.cell} key={key}>{control}</div>);
    }

    private _row(controls: JSX.Element[], key: number): JSX.Element {

        let cells: JSX.Element[] = [];

        controls.forEach((control: JSX.Element, i: number) => {
            cells.push(
                <div className={styles.cell} key={key++}>{control}</div>
            );
        });
        return (
            <div key={key++}>
                {cells}
            </div>
        );
    }

    private _hasChoices(field: ISearchProperty): boolean {
        return field.choices && field.choices.length > 0;
    }
    
    private _isSearchPropertyChoice(choice: any): choice is ISearchPropertyChoice {
        return choice && typeof choice !== 'string' && typeof choice !== 'number';
    }

    private _conformPropertyChoices(config: ISearchProperty[]): void {
        const delim = "|";

        config.forEach(field => {
            if(field.type == PropertyValueType.Boolean) {
                field.data = field.data || EmptyValue();

                field.propertyChoices = [
                    { key: `true`, text: 'Yes', value: 'true' }, 
                    { key: `false`, text: 'No', value: 'false' }
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
                    } as ISearchPropertyChoice);
                });
            }
        });
    }
}
