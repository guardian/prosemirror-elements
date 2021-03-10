import TFields from './Fields';

type TValidator<FieldAttrs extends TFields> = (fields: FieldAttrs) => null| {[field: string]: string[]};

export default TValidator;
