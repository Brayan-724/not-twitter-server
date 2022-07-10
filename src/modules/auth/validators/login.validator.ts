import {
  BodyValidator,
  PartValidator,
  StringCaseValidator,
} from '../../../utils/BodyValidator/index';

export class LoginValidator extends BodyValidator {
  constructor() {
    super();

    this.getPart(
      new PartValidator('username')
        .isRequired()
        .case(new StringCaseValidator().isRequired()),
    );

    this.getPart(
      new PartValidator('password')
        .isRequired()
        .case(new StringCaseValidator().isRequired()),
    );
  }
}
