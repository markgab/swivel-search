import { PrimaryButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
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
import { IPersonaProps } from 'office-ui-fabric-react';
import SwivelSearchGlobals from '../../../model/SwivelSearchGlobals';

const AdvancedMinimized: string = `${styles.pnlAdvanced} ${styles.pnlAdvancedMinimized}`;
const AdvancedExpanded: string = styles.pnlAdvanced;
const NumColumns: number = 2;
const FieldHeight: number = 61;
const ButtonRowHeight: number = 62;

export interface ISearchInterfaceProps {
    searchHandler: (keywordSearch: string, controlValues: { [key: string]: any }) => void;
    parentElement: HTMLElement;
}

export interface ISearchInterfaceState {
    keywordSearch: string;
    classNameAdvanced: string;
    showAdvanced: boolean;
    controlValues: { [key: string]: any };
}

export default class SearchInterface extends React.Component<ISearchInterfaceProps, ISearchInterfaceState> {

    constructor(props: ISearchInterfaceProps) {
        super(props);

        const { searchConfig, startMinimized, includeKeywordSearch } = SwivelSearchGlobals.propsSearchInterface;

        this._conformPropertyChoices(searchConfig);

        this.state = {
            keywordSearch: '',
            classNameAdvanced: startMinimized && includeKeywordSearch ? AdvancedMinimized : AdvancedExpanded,
            showAdvanced: !(startMinimized && includeKeywordSearch),
            controlValues: {},
        } as ISearchInterfaceState;

    }


    public componentDidUpdate(prevProps, prevState) {
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


        const { searchConfig } = SwivelSearchGlobals.propsSearchInterface;
        const { controlValues, showAdvanced } = this.state;

        searchConfig.forEach((field: ISearchProperty, i: number) => {

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
                                //value={field.value as any}
                                value={controlValues[field.property]}
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
                                    //selectedKey={field.choicesSelectedKey as any}
                                    selectedKey={controlValues[field.property]}
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
                                    //value={field.value as string}
                                    value={controlValues[field.property]}
                                    autoComplete={"new-password"}
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
                            placeholder={field.operator}
                            data-index={i}
                            key={field.property}
                            //selectedItems={field.value as IPersonaProps[]}
                            selectedItems={controlValues[field.property]}
                        />
                    );
                    break;
                case PropertyValueType.Boolean:

                    controls.push(
                        <DropdownResettable 
                            placeHolder={field.operator}
                            label={field.name} 
                            onChanged={e => this.ctrl_changed(e, field)}
                            options={field.propertyChoices as IDropdownResettableOption[]}
                            //selectedKey={field.choicesSelectedKey as any}
                            selectedKey={controlValues[field.property]}
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
                            //value={field.value as IDateRangeValue}
                            value={controlValues[field.property]}
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
                        maxHeight: searchConfig.length * FieldHeight + ButtonRowHeight
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
        const key = e.keyCode;

        switch(key) {
            case 13:    // Enter
                this.btnSearch_click();
                break;
        }

    }

    protected keywordSearch(): React.ReactElement<HTMLDivElement> {
        const { showAdvanced } = this.state;
        const { includeKeywordSearch, startMinimized } = SwivelSearchGlobals.propsSearchInterface;
        if(includeKeywordSearch) {
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
                        suffix={startMinimized ? "Advanced" : ""}
                        onRenderSuffix={(props: ITextFieldProps): JSX.Element => {
                            const { suffix } = props;
                            if(startMinimized) {
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
         this.setState({
            ...this.state,
            keywordSearch
         } as ISearchInterfaceState);
    }

    protected btnSearch_click = (e?: React.MouseEvent<any>): void => {
        this.props.searchHandler(this.state.keywordSearch, this.state.controlValues);
    }

    protected btnReset_click = (e: React.MouseEvent<any>): void => {

        const keywordSearch = "";

        //const config = [ ...this.state.config ] as ISearchProperty[];
        const { searchConfig } = SwivelSearchGlobals.propsSearchInterface;
        const { controlValues } = this.state;

        searchConfig.forEach((field: ISearchProperty) => {

            switch(true) {
                case field.type === PropertyValueType.Boolean:
                case this._hasChoices(field):
                    controlValues[field.property] = '';
                    //field.choicesSelectedKey = '';
                    //field.value = null;
                    break;
                case field.type === PropertyValueType.Person:
                    controlValues[field.property] = [];
                    //field.value = [];
                    break;
                default:
                    controlValues[field.property] = null;
            }

        });

        this.setState({
            controlValues,
            keywordSearch,
        } as ISearchInterfaceState);
    }

    protected ctrl_changed(val: any, field: ISearchProperty): void {

        console.log('ctrl_changed', arguments);

        const { controlValues } = this.state;
        controlValues[field.property] = val;


        this.setState({
            controlValues,
        });
        
    }


    private _cell(control: JSX.Element, key: string): JSX.Element {
        return (<div className={styles.cell} key={key}>{control}</div>);
    }

    private _row(controls: JSX.Element[], key: number): JSX.Element {

        const cells: JSX.Element[] = [];

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
    
    /* 
    private _isSearchPropertyChoice(choice: any): choice is ISearchPropertyChoice {
        return choice && typeof choice !== 'string' && typeof choice !== 'number';
    } */

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
                    const key = `${field.property}-${idx}`;

                    if(text.indexOf(delim) !== -1) {
                        const arr = text.split(delim);
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
