import {
  BodyValidator,
  GlobalValidator,
  NumberCaseValidator,
  PartValidator,
  StringCaseValidator,
} from '../../../utils/BodyValidator/index';

export class RegisterValidator extends BodyValidator {
  constructor() {
    super();

    this.getPart(
      new PartValidator('username').isRequired().case(
        new StringCaseValidator()
          .isRequired()
          .minLength(4)
          .maxLength(15)
          .isLowerCase(true)
          .regex(
            /^[a-z0-9_]+$/,
            'Username can only contain lowercase letters and numbers',
          ),
      ),
    );

    this.getPart(
      new PartValidator('password')
        .isRequired()
        .case(
          new StringCaseValidator().isRequired().minLength(8).maxLength(33),
        ),
    );

    this.getPart(
      new PartValidator('name')
        .isRequired()
        .case(
          new StringCaseValidator().isRequired().minLength(4).maxLength(20),
        ),
    );

    this.getPart(
      new PartValidator('email').isRequired().case(
        new StringCaseValidator()
          .isRequired()
          .minLength(4)
          .maxLength(50)
          .regex(
            /^(\w|\.){3,}@[a-z]{3,}(\.[a-z]{2,})+$/,
            'Invalid email format',
          ),
      ),
    );

    this.getPart(
      new PartValidator('description')
        .globalCase(new GlobalValidator().default(''))
        .case(new StringCaseValidator()),
    );

    this.getPart(
      new PartValidator('birthday')
        .isRequired()
        .case(new NumberCaseValidator().isRequired().min(1000000)),
    );
  }
}
